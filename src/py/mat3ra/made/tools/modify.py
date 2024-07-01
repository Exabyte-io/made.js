from typing import Callable, List, Optional, Union

import numpy as np
from mat3ra.made.material import Material

from .analyze import get_atom_indices_with_condition_on_coordinates, get_atom_indices_within_radius_pbc
from .convert import decorator_convert_material_args_kwargs_to_structure
from .third_party import PymatgenSpacegroupAnalyzer, PymatgenStructure
from .utils import (
    is_coordinate_in_box,
    is_coordinate_in_cylinder,
    is_coordinate_in_triangular_prism,
    is_coordinate_within_layer,
    translate_to_bottom_pymatgen_structure,
)


def filter_by_label(material: Material, label: Union[int, str]) -> Material:
    """
    Filter out only atoms corresponding to the label.

    Args:
        material (Material): The material object to filter.
        label (int|str): The tag/label to filter by.

    Returns:
        Material: The filtered material object.
    """
    new_material = material.clone()
    labels_array = new_material.basis.labels.to_array_of_values_with_ids()
    filtered_label_ids = [_label.id for _label in labels_array if _label.value == label]
    new_basis = new_material.basis
    new_basis.filter_atoms_by_ids(filtered_label_ids)
    new_material.basis = new_basis
    return new_material


@decorator_convert_material_args_kwargs_to_structure
def translate_to_bottom(structure: PymatgenStructure, use_conventional_cell: bool = True):
    """
    Translate atoms to the bottom of the cell (vacuum on top) to allow for the correct consecutive interface generation.
    If use_conventional_cell is passed, conventional cell is used.

    Args:
        structure (Structure): The pymatgen Structure object to normalize.
        use_conventional_cell: Whether to convert to the conventional cell.
    Returns:
        Structure: The normalized pymatgen Structure object.
    """
    if use_conventional_cell:
        structure = PymatgenSpacegroupAnalyzer(structure).get_conventional_standard_structure()
    structure = translate_to_bottom_pymatgen_structure(structure)
    return structure


@decorator_convert_material_args_kwargs_to_structure
def wrap_to_unit_cell(structure: PymatgenStructure):
    """
    Wrap atoms to the cell

    Args:
        structure (PymatgenStructure): The pymatgen PymatgenStructure object to normalize.
    Returns:
        PymatgenStructure: The wrapped pymatgen PymatgenStructure object.
    """
    structure.make_supercell((1, 1, 1), to_unit_cell=True)
    return structure


def filter_material_by_ids(material: Material, ids: List[int], invert: bool = False) -> Material:
    """
    Filter out only atoms corresponding to the ids.

    Args:
        material (Material): The material object to filter.
        ids (List[int]): The ids to filter by.
        invert (bool): Whether to invert the selection.

    Returns:
        Material: The filtered material object.
    """
    new_material = material.clone()
    new_basis = new_material.basis
    if invert is True:
        ids = list(set(new_basis.elements.ids) - set(ids))
    new_basis.filter_atoms_by_ids(ids)
    new_material.basis = new_basis
    return new_material


def filter_by_condition_on_coordinates(
    material: Material,
    condition: Callable[[List[float]], bool],
    use_cartesian_coordinates: bool = False,
    invert_selection: bool = False,
) -> Material:
    """
    Filter atoms based on a condition on their coordinates.

    Args:
        material (Material): The material object to filter.
        condition (Callable): The condition on coordinate function.
        use_cartesian_coordinates (bool): Whether to use cartesian coordinates.
        invert_selection (bool): Whether to invert the selection.

    Returns:
        Material: The filtered material object.
    """
    new_material = material.clone()
    ids = get_atom_indices_with_condition_on_coordinates(
        material,
        condition,
        use_cartesian_coordinates=use_cartesian_coordinates,
    )

    new_material = filter_material_by_ids(new_material, ids, invert=invert_selection)
    return new_material


def filter_by_layers(
    material: Material,
    center_coordinate: List[float] = [0, 0, 0],
    central_atom_id: Optional[int] = None,
    layer_thickness: float = 1.0,
    invert_selection: bool = False,
) -> Material:
    """
    Filter out atoms within a specified layer thickness of a central atom along c-vector direction.

    Args:
        material (Material): The material object to filter.
        center_coordinate (List[float]): Index of the central atom.
        central_atom_id (int): Index of the central atom.
        layer_thickness (float): Thickness of the layer in angstroms.
        invert_selection (bool): Whether to invert the selection.

    Returns:
        Material: The filtered material object.
    """
    if central_atom_id is not None:
        center_coordinate = material.basis.coordinates.get_element_value_by_index(central_atom_id)
    vectors = material.lattice.vectors
    direction_vector = np.array(vectors[2])

    def condition(coordinate):
        return is_coordinate_within_layer(coordinate, center_coordinate, direction_vector, layer_thickness)

    return filter_by_condition_on_coordinates(material, condition, invert_selection=invert_selection)


def filter_by_sphere(
    material: Material,
    center_coordinate: List[float] = [0, 0, 0],
    central_atom_id: Optional[int] = None,
    radius: float = 1,
    invert: bool = False,
) -> Material:
    """
    Filter out atoms within a specified radius of a central atom considering periodic boundary conditions.

    Args:
        material (Material): The material object to filter.
        central_atom_id (int): Index of the central atom.
        radius (float): Radius of the sphere in angstroms.
        invert (bool): Whether to invert the selection.

    Returns:
        Material: The filtered material object.
    """
    ids = get_atom_indices_within_radius_pbc(
        material=material,
        atom_index=central_atom_id,
        position=center_coordinate,
        radius=radius,
    )
    return filter_material_by_ids(material, ids, invert=invert)


def filter_by_circle_projection(
    material: Material,
    x: float = 0.5,
    y: float = 0.5,
    r: float = 0.25,
    use_cartesian_coordinates: bool = False,
    invert_selection: bool = False,
) -> Material:
    """
    Get material with atoms that are within or outside an XY circle projection.

    Args:
        material (Material): The material object to filter.
        x (float): The x-coordinate of the circle center.
        y (float): The y-coordinate of the circle center.
        r (float): The radius of the circle.
        use_cartesian_coordinates (bool): Whether to use cartesian coordinates
        invert_selection (bool): Whether to invert the selection.

    Returns:
        Material: The filtered material object.
    """

    def condition(coordinate):
        return is_coordinate_in_cylinder(coordinate, [x, y, 0], r, min_z=0, max_z=1)

    return filter_by_condition_on_coordinates(
        material, condition, use_cartesian_coordinates=use_cartesian_coordinates, invert_selection=invert_selection
    )


def filter_by_cylinder(
    material: Material,
    center_position: List[float] = [0.5, 0.5],
    min_z: float = 0,
    max_z: float = 1,
    radius: float = 0.25,
    use_cartesian_coordinates: bool = False,
    invert_selection: bool = False,
) -> Material:
    """
    Get material with atoms that are within or outside a cylinder.

    Args:
        material (Material): The material object to filter.
        center_position (List[float]): The coordinates of the center position.
        radius (float): The radius of the cylinder.
        min_z (float): Lower limit of z-coordinate.
        max_z (float): Upper limit of z-coordinate.
        use_cartesian_coordinates (bool): Whether to use cartesian coordinates
        invert_selection (bool): Whether to invert the selection.

    Returns:
        Material: The filtered material object.
    """

    def condition(coordinate):
        return is_coordinate_in_cylinder(coordinate, center_position, radius, min_z, max_z)

    return filter_by_condition_on_coordinates(
        material, condition, use_cartesian_coordinates=use_cartesian_coordinates, invert_selection=invert_selection
    )


def filter_by_rectangle_projection(
    material: Material,
    min_coordinate: List[float] = [0, 0],
    max_coordinate: List[float] = [1, 1],
    use_cartesian_coordinates: bool = False,
    invert_selection: bool = False,
) -> Material:
    """
    Get material with atoms that are within or outside an XY rectangle projection.

    Args:
        material (Material): The material object to filter.
        min_coordinate (List[float]): The minimum coordinate of the rectangle.
        max_coordinate (List[float]): The maximum coordinate of the rectangle.
        use_cartesian_coordinates (bool): Whether to use cartesian coordinates
        invert_selection (bool): Whether to invert the selection.

    Returns:
        Material: The filtered material object.
    """
    min_coordinate = min_coordinate[:2] + [0]
    max_coordinate = max_coordinate[:2] + [1]

    def condition(coordinate):
        return is_coordinate_in_box(coordinate, min_coordinate, max_coordinate)

    return filter_by_condition_on_coordinates(
        material, condition, use_cartesian_coordinates=use_cartesian_coordinates, invert_selection=invert_selection
    )


def filter_by_box(
    material: Material,
    min_coordinate: List[float] = [0.0, 0.0, 0.0],
    max_coordinate: List[float] = [1.0, 1.0, 1.0],
    use_cartesian_coordinates: bool = False,
    invert_selection: bool = False,
) -> Material:
    """
    Get material with atoms that are within or outside an XYZ box.
    """

    def condition(coordinate):
        return is_coordinate_in_box(coordinate, min_coordinate, max_coordinate)

    return filter_by_condition_on_coordinates(
        material, condition, use_cartesian_coordinates=use_cartesian_coordinates, invert_selection=invert_selection
    )


def filter_by_triangle_projection(
    material: Material,
    coordinate_1: List[float] = [0, 0],
    coordinate_2: List[float] = [0, 1],
    coordinate_3: List[float] = [1, 0],
    min_z: float = 0,
    max_z: float = 1,
    use_cartesian_coordinates: bool = False,
    invert_selection: bool = False,
) -> Material:
    """
    Get material with atoms that are within or outside a prism formed by triangle projection.

    Args:
        material (Material): The material object to filter.
        coordinate_1 (List[float]): The coordinate of the first vertex.
        coordinate_2 (List[float]): The coordinate of the second vertex.
        coordinate_3 (List[float]): The coordinate of the third vertex.
        min_z (float): Lower limit of z-coordinate.
        max_z (float): Upper limit of z-coordinate.
        use_cartesian_coordinates (bool): Whether to use cartesian coordinates
        invert_selection (bool): Whether to invert the selection.

    Returns:
        Material: The filtered material object.
    """

    def condition(coordinate):
        return is_coordinate_in_triangular_prism(coordinate, coordinate_1, coordinate_2, coordinate_3, min_z, max_z)

    return filter_by_condition_on_coordinates(
        material, condition, use_cartesian_coordinates=use_cartesian_coordinates, invert_selection=invert_selection
    )
