from pymatgen.core.structure import Structure
from pymatgen.core.surface import SlabGenerator as PymatgenSlabGenerator
from pymatgen.core.interface import label_termination
from pymatgen.analysis.structure_analyzer import SpacegroupAnalyzer
from typing import Any, List, Tuple
import json

from .supercell import create_supercell
from ..convert import decorator_convert_material_args_kwargs_to_structure, from_pymatgen
from ...material import Material


@decorator_convert_material_args_kwargs_to_structure
class SlabGenerator:
    """Class to generate slabs and manage different terminations."""

    def __init__(self, bulk, miller_indices, thickness, vacuum, xy_supercell_matrix, use_conventional_cell=True):
        self.bulk = bulk
        self.miller_indices = miller_indices
        self.thickness = thickness
        self.vacuum = vacuum
        self.xy_supercell_matrix = xy_supercell_matrix
        self.generator = PymatgenSlabGenerator(
            SpacegroupAnalyzer(self.bulk).get_conventional_standard_structure() if use_conventional_cell else self.bulk,
            miller_index=self.miller_indices,
            min_slab_size=self.thickness,
            min_vacuum_size=self.vacuum,
            in_unit_planes=True,
            reorient_lattice=True,
        )
        self._slab_structures = self.generator.get_slabs()
        self.slabs = [
            create_supercell(Material(from_pymatgen(slab_structure)), xy_supercell_matrix)
            for slab_structure in self._slab_structures
            if slab_structure
        ]
        self.terminations = self.get_terminations()

    def get_terminations(self):
        """Get unique terminations available for the generated slabs."""
        return list(set(label_termination(slab) for slab in self._slab_structures if slab))

    def get_slab_with_termination(self, termination):
        """Get the first slab that matches the specified termination."""
        for slab_structure in self._slab_structures:
            if label_termination(slab_structure) == termination:
                return create_supercell(Material(from_pymatgen(slab_structure)), self.xy_supercell_matrix)
        return None


class Slab(Material):
    def __init__(
        self,
        config: Any,
        termination: str,
        miller_indices: Tuple[int, int, int] = (0, 0, 1),
        thickness: int = 10,
        vacuum: float = 10.0,
        xy_supercell_matrix: List[List[int]] = [[1, 0], [0, 1]],
    ):
        super().__init__(config)
        self.structure = Structure.from_dict(config)
        self.miller_indices = miller_indices
        self.thickness = thickness
        self.vacuum = vacuum
        self.xy_supercell_matrix = xy_supercell_matrix
        self.termination = termination
        self.slab = self.generate_slab()

    # def generate_slab(self):
    #     slab_generator = SlabGenerator(self.structure, self.miller_indices, self.thickness, self.vacuum)
    #     return slab_generator.generate_slab(self.termination)

    def __repr__(self):
        return json.dumps(self.__dict__)

    @property
    def json_representation(self):
        return {
            "miller_indices": self.miller_indices,
            "thickness": self.thickness,
            "vacuum": self.vacuum,
            "xy_supercell_matrix": self.xy_supercell_matrix,
            "termination": self.termination,
            "slab_data": self.slab.as_dict() if self.slab else {},
        }