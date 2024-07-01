from functools import wraps
from typing import Callable, List

import numpy as np
from mat3ra.made.basis import Basis
from mat3ra.utils.matrix import convert_2x2_to_3x3

from .third_party import PymatgenStructure


# TODO: convert to accept ASE Atoms object
def translate_to_bottom_pymatgen_structure(structure: PymatgenStructure):
    """
    Translate the structure to the bottom of the cell.
    Args:
        structure (PymatgenStructure): The pymatgen Structure object to translate.

    Returns:
        PymatgenStructure: The translated pymatgen Structure object.
    """
    min_c = min(site.c for site in structure)
    translation_vector = [0, 0, -min_c]
    translated_structure = structure.copy()
    for site in translated_structure:
        site.coords += translation_vector
    return translated_structure


def decorator_convert_2x2_to_3x3(func: Callable) -> Callable:
    """
    Decorator to convert a 2x2 matrix to a 3x3 matrix.
    """

    @wraps(func)
    def wrapper(*args, **kwargs):
        new_args = [convert_2x2_to_3x3(arg) if isinstance(arg, list) and len(arg) == 2 else arg for arg in args]
        return func(*new_args, **kwargs)

    return wrapper


def convert_basis_to_cartesian(basis: Basis) -> Basis:
    """
    Convert the basis to the Cartesian coordinates.
    Args:
        basis (Dict): The basis to convert.

    Returns:
        Dict: The basis in Cartesian coordinates.
    """
    if basis.units == "cartesian":
        return basis
    unit_cell = np.array(basis.cell)
    basis.coordinates = np.multiply(basis.coordinates, unit_cell)
    basis.units = "cartesian"
    return basis


def convert_basis_to_crystal(basis: Basis) -> Basis:
    """
    Convert the basis to the crystal coordinates.
    Args:
        basis (Dict): The basis to convert.

    Returns:
        Dict: The basis in crystal coordinates.
    """
    if basis.units == "crystal":
        return basis
    unit_cell = np.array(basis.cell)
    basis.coordinates.values = np.multiply(basis.coordinates.values, np.linalg.inv(unit_cell))
    basis.units = "crystal"
    return basis


def get_distance_between_coordinates(coordinate1: List[float], coordinate2: List[float]) -> float:
    """
    Get the distance between two coordinates.
    Args:
        coordinate1 (List[float]): The first coordinate.
        coordinate2 (List[float]): The second coordinate.

    Returns:
        float: The distance between the two coordinates.
    """
    return float(np.linalg.norm(np.array(coordinate1) - np.array(coordinate2)))


def get_norm(vector: List[float]) -> float:
    """
    Get the norm of a vector.
    Args:
        vector (List[float]): The vector.

    Returns:
        float: The norm of the vector.
    """
    return float(np.linalg.norm(vector))


# Condition functions:


def is_coordinate_in_cylinder(
    coordinate: List[float], center_position: List[float], radius: float = 0.25, min_z: float = 0, max_z: float = 1
) -> bool:
    """
    Check if a coordinate is inside a cylinder.
    Args:
        coordinate (List[float]): The coordinate to check.
        center_position (List[float]): The coordinates of the center position.
        min_z (float): Lower limit of z-coordinate.
        max_z (float): Upper limit of z-coordinate.
        radius (float): The radius of the cylinder.

    Returns:
        bool: True if the coordinate is inside the cylinder, False otherwise.
    """
    return (coordinate[0] - center_position[0]) ** 2 + (coordinate[1] - center_position[1]) ** 2 <= radius**2 and (
        min_z <= coordinate[2] <= max_z
    )


def is_coordinate_in_box(
    coordinate: List[float], min_coordinate: List[float] = [0, 0, 0], max_coordinate: List[float] = [1, 1, 1]
) -> bool:
    """
    Check if a coordinate is inside a box.
    Args:
        coordinate (List[float]): The coordinate to check.
        min_coordinate (List[float]): The minimum coordinate of the box.
        max_coordinate (List[float]): The maximum coordinate of the box.
    Returns:
        bool: True if the coordinate is inside the box, False otherwise.
    """
    x_min, y_min, z_min = min_coordinate
    x_max, y_max, z_max = max_coordinate
    return x_min <= coordinate[0] <= x_max and y_min <= coordinate[1] <= y_max and z_min <= coordinate[2] <= z_max


def is_coordinate_within_layer(
    coordinate: List[float], center_position: List[float], direction_vector: List[float], layer_thickness: float
) -> bool:
    """
    Checks if a coordinate's projection along a specified direction vector
    is within a certain layer thickness centered around a given position.

    Args:
        coordinate (List[float]): The coordinate to check.
        center_position (List[float]): The coordinates of the center position.
        direction_vector (List[float]): The direction vector along which the layer thickness is defined.
        layer_thickness (float): The thickness of the layer along the direction vector.

    Returns:
        bool: True if the coordinate is within the layer thickness, False otherwise.
    """
    direction_norm = np.array(direction_vector) / np.linalg.norm(direction_vector)
    central_projection = np.dot(center_position, direction_norm)
    layer_thickness_frac = layer_thickness / np.linalg.norm(direction_vector)

    lower_bound = central_projection - layer_thickness_frac / 2
    upper_bound = central_projection + layer_thickness_frac / 2

    return lower_bound <= np.dot(coordinate, direction_norm) <= upper_bound


def is_coordinate_in_triangular_prism(
    coordinate: List[float],
    coordinate_1: List[float],
    coordinate_2: List[float],
    coordinate_3: List[float],
    min_z: float = 0,
    max_z: float = 1,
) -> bool:
    """
    Check if a coordinate is inside a triangular prism.
    Args:
        coordinate (List[float]): The coordinate to check.
        coordinate_1 (List[float]): The first coordinate of the triangle.
        coordinate_2 (List[float]): The second coordinate of the triangle.
        coordinate_3 (List[float]): The third coordinate of the triangle.
        min_z (float): Lower limit of z-coordinate.
        max_z (float): Upper limit of z-coordinate.

    Returns:
        bool: True if the coordinate is inside the triangular prism, False otherwise.
    """
    # convert to 3D coordinates at the origin XY plane
    coordinate_1.extend([0] * (3 - len(coordinate_1)))
    coordinate_2.extend([0] * (3 - len(coordinate_2)))
    coordinate_3.extend([0] * (3 - len(coordinate_3)))

    coordinate = np.array(coordinate)
    v1 = np.array(coordinate_1)
    v2 = np.array(coordinate_2)
    v3 = np.array(coordinate_3)

    v2_v1 = v2 - v1
    v3_v1 = v3 - v1
    coordinate_v1 = coordinate - v1

    # Compute dot products for the barycentric coordinates
    d00 = np.dot(v2_v1, v2_v1)
    d01 = np.dot(v2_v1, v3_v1)
    d11 = np.dot(v3_v1, v3_v1)
    d20 = np.dot(coordinate_v1, v2_v1)
    d21 = np.dot(coordinate_v1, v3_v1)

    # Calculate barycentric coordinates
    denom = d00 * d11 - d01 * d01
    v = (d11 * d20 - d01 * d21) / denom
    w = (d00 * d21 - d01 * d20) / denom
    u = 1.0 - v - w

    return (u >= 0) and (v >= 0) and (w >= 0) and (u + v + w <= 1) and (min_z <= coordinate[2] <= max_z)
