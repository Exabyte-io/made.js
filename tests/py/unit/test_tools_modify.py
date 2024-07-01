from ase.build import bulk
from mat3ra.made.material import Material
from mat3ra.made.tools.convert import from_ase
from mat3ra.made.tools.modify import (
    filter_by_circle_projection,
    filter_by_label,
    filter_by_layers,
    filter_by_rectangle_projection,
    filter_by_sphere,
    filter_by_triangle_projection,
)
from mat3ra.utils import assertion as assertion_utils

from .fixtures import SI_CONVENTIONAL_CELL

COMMON_PART = {
    "units": "crystal",
    "cell": [[5.468763846, 0.0, 0.0], [-0.0, 5.468763846, 0.0], [0.0, 0.0, 5.468763846]],
    "labels": [],
}

expected_basis_layers_section = {
    "elements": [
        {"id": 0, "value": "Si"},
        {"id": 3, "value": "Si"},
        {"id": 5, "value": "Si"},
        {"id": 6, "value": "Si"},
    ],
    "coordinates": [
        {"id": 0, "value": [0.5, 0.0, 0.0]},
        {"id": 3, "value": [0.25, 0.75, 0.25]},
        {"id": 5, "value": [0.75, 0.25, 0.25]},
        {"id": 6, "value": [0.0, 0.5, 0.0]},
    ],
    **COMMON_PART,
}

expected_basis_layers_cavity = {
    "elements": [
        {"id": 1, "value": "Si"},
        {"id": 2, "value": "Si"},
        {"id": 4, "value": "Si"},
        {"id": 7, "value": "Si"},
    ],
    "coordinates": [
        {"id": 1, "value": [0.25, 0.25, 0.75]},
        {"id": 2, "value": [0.5, 0.5, 0.5]},
        {"id": 4, "value": [0.0, 0.0, 0.5]},
        {"id": 7, "value": [0.75, 0.75, 0.75]},
    ],
    **COMMON_PART,
}


expected_basis_sphere_cluster = {
    "elements": [{"id": 2, "value": "Si"}],
    "coordinates": [{"id": 2, "value": [0.5, 0.5, 0.5]}],
    **COMMON_PART,
}

expected_basis_sphere_cavity = {
    "elements": [
        {"id": 0, "value": "Si"},
        {"id": 1, "value": "Si"},
        {"id": 3, "value": "Si"},
        {"id": 4, "value": "Si"},
        {"id": 5, "value": "Si"},
        {"id": 6, "value": "Si"},
        {"id": 7, "value": "Si"},
    ],
    "coordinates": [
        {"id": 0, "value": [0.5, 0.0, 0.0]},
        {"id": 1, "value": [0.25, 0.25, 0.75]},
        {"id": 3, "value": [0.25, 0.75, 0.25]},
        {"id": 4, "value": [0.0, 0.0, 0.5]},
        {"id": 5, "value": [0.75, 0.25, 0.25]},
        {"id": 6, "value": [0.0, 0.5, 0.0]},
        {"id": 7, "value": [0.75, 0.75, 0.75]},
    ],
    **COMMON_PART,
}

CRYSTAL_RADIUS = 0.25  # in crystal coordinates
CRYSTAL_CENTER_3D = [0.5, 0.5, 0.5]  # in crystal coordinates


def test_filter_by_label():
    substrate = bulk("Si", cubic=True)
    film = bulk("Cu", cubic=True)
    interface_atoms = substrate + film
    interface_atoms.set_tags([1] * len(substrate) + [2] * len(film))
    material_interface = Material(from_ase(interface_atoms))
    film_extracted = filter_by_label(material_interface, 2)
    film_material = Material(from_ase(film))

    # Ids of filtered elements will be missing, comparing the resulting values
    assert [el for el in film_material.basis.elements.values] == [el for el in film_extracted.basis.elements.values]


def test_filter_by_layers():
    material = Material(SI_CONVENTIONAL_CELL)
    section = filter_by_layers(material=material, central_atom_id=0, layer_thickness=3.0)
    cavity = filter_by_layers(material=material, central_atom_id=0, layer_thickness=3.0, invert_selection=True)
    assertion_utils.assert_deep_almost_equal(expected_basis_layers_section, section.basis.to_json())
    assertion_utils.assert_deep_almost_equal(expected_basis_layers_cavity, cavity.basis.to_json())


def test_filter_by_sphere():
    material = Material(SI_CONVENTIONAL_CELL)
    cluster = filter_by_sphere(material, center_coordinate=CRYSTAL_CENTER_3D, radius=CRYSTAL_RADIUS)
    cavity = filter_by_sphere(material, center_coordinate=CRYSTAL_CENTER_3D, radius=CRYSTAL_RADIUS, invert=True)
    assertion_utils.assert_deep_almost_equal(expected_basis_sphere_cluster, cluster.basis.to_json())
    assertion_utils.assert_deep_almost_equal(expected_basis_sphere_cavity, cavity.basis.to_json())


def test_filter_by_circle_projection():
    material = Material(SI_CONVENTIONAL_CELL)
    # Small cylinder in the middle of the cell containing the central atom will be removed -- the same as with sphere
    section = filter_by_circle_projection(material, 0.5, 0.5, CRYSTAL_RADIUS)
    cavity = filter_by_circle_projection(material, 0.5, 0.5, CRYSTAL_RADIUS, invert_selection=True)
    assertion_utils.assert_deep_almost_equal(expected_basis_sphere_cluster, section.basis.to_json())
    assertion_utils.assert_deep_almost_equal(expected_basis_sphere_cavity, cavity.basis.to_json())


def test_filter_by_rectangle_projection():
    material = Material(SI_CONVENTIONAL_CELL)
    # Default will contain all the atoms
    section = filter_by_rectangle_projection(material)
    assertion_utils.assert_deep_almost_equal(material.basis.to_json(), section.basis.to_json())


def test_filter_by_triangle_projection():
    # Small prism in the middle of the cell containing the central atom will be removed -- the same as with sphere
    material = Material(SI_CONVENTIONAL_CELL)
    section = filter_by_triangle_projection(material, [0.4, 0.4], [0.4, 0.5], [0.5, 0.5])
    cavity = filter_by_triangle_projection(material, [0.4, 0.4], [0.4, 0.5], [0.5, 0.5], invert_selection=True)
    assertion_utils.assert_deep_almost_equal(expected_basis_sphere_cluster, section.basis.to_json())
    assertion_utils.assert_deep_almost_equal(expected_basis_sphere_cavity, cavity.basis.to_json())
