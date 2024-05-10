import functools
import types
import numpy as np
from typing import Union, List, Tuple, Dict
from enum import Enum
from mat3ra.utils import array as array_utils
from pymatgen.core.structure import Structure
from pymatgen.analysis.interfaces.coherent_interfaces import CoherentInterfaceBuilder, ZSLGenerator
from pymatgen.analysis.interfaces.coherent_interfaces import Interface
from ..convert import convert_atoms_or_structure_to_material, decorator_convert_material_args_kwargs_to_structure


DEFAULT_MAX_AREA = 400.0


class SlabParameters:
    def __init__(self, miller_indices: Tuple[int, int, int] = (0, 0, 1), thickness: int = 3):
        self.miller_indices = miller_indices
        self.thickness = thickness


class ZSLParameters:
    def __init__(
        self,
        max_area: float = DEFAULT_MAX_AREA,
        max_area_tol: float = 0.09,
        max_length_tol: float = 0.03,
        max_angle_tol: float = 0.01,
    ):
        self.max_area = max_area
        self.max_area_tol = max_area_tol
        self.max_length_tol = max_length_tol
        self.max_angle_tol = max_angle_tol


class InterfaceSettings:
    def __init__(
        self,
        SubstrateParameters=SlabParameters(miller_indices=(0, 0, 1), thickness=3),
        LayerParameters=SlabParameters(miller_indices=(0, 0, 1), thickness=1),
        max_area=DEFAULT_MAX_AREA,
        distance_z=3.0,
        use_conventional_cell=True,
        ZSLParameters=ZSLParameters(),
    ):
        self.SubstrateParameters = SubstrateParameters
        self.LayerParameters = LayerParameters

        self.max_area = max_area
        self.distance_z = distance_z
        self.use_conventional_cell = use_conventional_cell

        self.ZSLParameters = ZSLParameters
        if self.max_area != DEFAULT_MAX_AREA:
            self.ZSLParameters.max_area = self.max_area


class StrainModes(Enum):
    strain = "strain"
    von_mises_strain = "von_mises_strain"
    mean_abs_strain = "mean_abs_strain"


def interface_patch_with_mean_abs_strain(target: Interface, tolerance: float = 10e-6):
    def get_mean_abs_strain(target):
        return target.interface_properties[StrainModes.mean_abs_strain]

    target.get_mean_abs_strain = types.MethodType(get_mean_abs_strain, target)
    target.interface_properties[StrainModes.mean_abs_strain] = (
        round(np.mean(np.abs(target.interface_properties["strain"])) / tolerance) * tolerance
    )
    return target


@decorator_convert_material_args_kwargs_to_structure
def interface_init_zsl_builder(
    substrate: Structure, layer: Structure, settings: InterfaceSettings
) -> CoherentInterfaceBuilder:
    generator: ZSLGenerator = ZSLGenerator(
        max_area_ratio_tol=settings.ZSLParameters.max_area_tol,
        max_area=settings.ZSLParameters.max_area,
        max_length_tol=settings.ZSLParameters.max_length_tol,
        max_angle_tol=settings.ZSLParameters.max_angle_tol,
    )

    builder = CoherentInterfaceBuilder(
        substrate_structure=substrate,
        film_structure=layer,
        substrate_miller=settings.SubstrateParameters.miller_indices,
        film_miller=settings.LayerParameters.miller_indices,
        zslgen=generator,
    )

    return builder


TerminationType = Tuple[str, str]
InterfacesType = List[Interface]
InterfacesDataType = Dict[Tuple, List[Interface]]


class InterfaceDataHolder(object):
    """
    A class to hold data for interfaces generated by pymatgen.
    Structures are stored in a dictionary with the termination as the key.
    Example data structure:
        {
            "('C_P6/mmm_2', 'Si_R-3m_1')": [
                { ...interface for ('C_P6/mmm_2', 'Si_R-3m_1') at index 0...},
                { ...interface for ('C_P6/mmm_2', 'Si_R-3m_1') at index 1...},
                ...
            ],
            "<termination at index 1>": [
                { ...interface for 'termination at index 1' at index 0...},
                { ...interface for 'termination at index 1' at index 1...},
                ...
            ]
        }
    """

    def __init__(self, entries: Union[InterfacesType, None] = None) -> None:
        if entries is None:
            entries = []
        self.data: InterfacesDataType = {}
        self.terminations: List[TerminationType] = []
        self.add_data_entries(entries)

    def __str__(self):
        terminations_list = f"There are {len(self.terminations)} terminations:" + ", ".join(
            f"\n{idx}: ({a}, {b})" for idx, (a, b) in enumerate(self.terminations)
        )
        interfaces_list = "\n".join(
            [
                f"There are {len(self.data[termination])} interfaces for termination {termination}:\n{idx}: "
                + f"{self.data[termination]}"
                for idx, termination in enumerate(self.terminations)
            ]
        )
        return f"{terminations_list}\n{interfaces_list}"

    def add_termination(self, termination: Tuple[str, str]):
        if termination not in self.terminations:
            self.terminations.append(termination)
            self.set_interfaces_for_termination(termination, [])

    def add_interfaces_for_termination(
        self, termination: TerminationType, interfaces: Union[InterfacesType, Interface]
    ):
        self.add_termination(termination)
        self.set_interfaces_for_termination(termination, self.get_interfaces_for_termination(termination) + interfaces)

    def add_data_entries(
        self,
        entries: List[Interface] = [],
        sort_interfaces_by_strain_and_size: bool = True,
        remove_duplicates: bool = True,
    ):
        entries = array_utils.convert_to_array_if_not(entries)
        all_terminations = [e.interface_properties["termination"] for e in entries]
        unique_terminations = list(set(all_terminations))
        for termination in unique_terminations:
            entries_for_termination = [
                entry for entry in entries if entry.interface_properties["termination"] == termination
            ]
            self.add_interfaces_for_termination(termination, entries_for_termination)
        if sort_interfaces_by_strain_and_size:
            self.sort_interfaces_for_all_terminations_by_strain_and_size()
        if remove_duplicates:
            self.remove_duplicate_interfaces()

    def set_interfaces_for_termination(self, termination: TerminationType, interfaces: List[Interface]):
        self.data[termination] = interfaces

    def get_termination(self, termination: Union[int, TerminationType]) -> TerminationType:
        if isinstance(termination, int):
            termination = self.terminations[termination]
        return termination

    def get_interfaces_for_termination_or_its_index(
        self, termination_or_its_index: Union[int, TerminationType]
    ) -> List[Interface]:
        termination = self.get_termination(termination_or_its_index)
        return self.data[termination]

    def get_interfaces_for_termination(
        self,
        termination_or_its_index: Union[int, TerminationType],
        slice_or_index_or_indices: Union[int, slice, List[int], None] = None,
    ) -> List[Interface]:
        interfaces = self.get_interfaces_for_termination_or_its_index(termination_or_its_index)
        return array_utils.filter_by_slice_or_index_or_indices(interfaces, slice_or_index_or_indices)

    def remove_duplicate_interfaces(self, strain_mode: StrainModes = StrainModes.mean_abs_strain):
        for termination in self.terminations:
            self.remove_duplicate_interfaces_for_termination(termination, strain_mode)

    def remove_duplicate_interfaces_for_termination(
        self, termination, strain_mode: StrainModes = StrainModes.mean_abs_strain
    ):
        def are_interfaces_duplicate(interface1: Interface, interface2: Interface):
            return interface1.num_sites == interface2.num_sites and np.allclose(
                interface1.interface_properties[strain_mode], interface2.interface_properties[strain_mode]
            )

        sorted_interfaces = self.get_interfaces_for_termination_sorted_by_size(termination)
        filtered_interfaces = [sorted_interfaces[0]] if sorted_interfaces else []

        for interface in sorted_interfaces[1:]:
            if not any(
                are_interfaces_duplicate(interface, unique_interface) for unique_interface in filtered_interfaces
            ):
                filtered_interfaces.append(interface)

        self.set_interfaces_for_termination(termination, filtered_interfaces)

    def get_interfaces_for_termination_sorted_by_strain(
        self, termination: Union[int, TerminationType], strain_mode: StrainModes = StrainModes.mean_abs_strain
    ) -> List[Interface]:
        return sorted(
            self.get_interfaces_for_termination(termination),
            key=lambda x: np.mean(np.abs(x.interface_properties[strain_mode])),
        )

    def get_interfaces_for_termination_sorted_by_size(
        self, termination: Union[int, TerminationType]
    ) -> List[Interface]:
        return sorted(
            self.get_interfaces_for_termination(termination),
            key=lambda x: x.num_sites,
        )

    def get_interfaces_for_termination_sorted_by_strain_and_size(
        self, termination: Union[int, TerminationType], strain_mode: StrainModes = StrainModes.mean_abs_strain
    ) -> List[Interface]:
        return sorted(
            self.get_interfaces_for_termination_sorted_by_strain(termination, strain_mode),
            key=lambda x: x.num_sites,
        )

    def sort_interfaces_for_all_terminations_by_strain_and_size(self):
        for termination in self.terminations:
            self.set_interfaces_for_termination(
                termination, self.get_interfaces_for_termination_sorted_by_strain_and_size(termination)
            )

    def get_all_interfaces(self) -> List[Interface]:
        return functools.reduce(lambda a, b: a + b, self.data.values())

    def get_interfaces_as_materials(
        self, termination: Union[int, TerminationType], slice_range_or_index: Union[int, slice]
    ) -> List[Interface]:
        return list(
            map(
                convert_atoms_or_structure_to_material,
                self.get_interfaces_for_termination(termination, slice_range_or_index),
            )
        )
