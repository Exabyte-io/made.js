from ase.build import bulk
from mat3ra.made.material import Material
from mat3ra.made.tools.build.utils import merge_materials
from mat3ra.made.tools.convert import from_ase
from mat3ra.made.tools.modify import filter_by_layers
from mat3ra.utils import assertion as assertion_utils

ase_ni = bulk("Ni", "fcc", a=3.52, cubic=True)
material = Material(from_ase(ase_ni))
section = filter_by_layers(material, 0, 1.0)
cavity = filter_by_layers(material, 0, 1.0, invert=True)

# Change 0th element
section.basis["elements"][0]["value"] = "Ge"

# Add 3rd element to cavity for collision
cavity.basis["elements"].append({"id": 3, "value": "S"})
cavity.basis["coordinates"].append({"id": 3, "value": section.basis["coordinates"][1]["value"]})

expected_merged_material_basis = {
    "elements": [{"id": 0, "value": "Ge"}, {"id": 3, "value": "S"}, {"id": 1, "value": "Ni"}, {"id": 2, "value": "Ni"}],
    "coordinates": [
        {"id": 0, "value": [0.0, 0.0, 0.0]},
        {"id": 3, "value": [0.5, 0.5, 0.0]},
        {"id": 1, "value": [0.0, 0.5, 0.5]},
        {"id": 2, "value": [0.5, 0.0, 0.5]},
    ],
    "labels": [],
}


expected_merged_material_reverse_basis = {
    "elements": [
        {"id": 1, "value": "Ni"},
        {"id": 2, "value": "Ni"},
        {"id": 3, "value": "Ni"},
        {"id": 0, "value": "Ge"},
    ],
    "coordinates": [
        {"id": 1, "value": [0.0, 0.5, 0.5]},
        {"id": 2, "value": [0.5, 0.0, 0.5]},
        {"id": 3, "value": [0.5, 0.5, 0.0]},
        {"id": 0, "value": [0.0, 0.0, 0.0]},
    ],
    "labels": [],
}


def test_merge_materials():
    merged_material = merge_materials([section, cavity])
    merged_material_reverse = merge_materials([cavity, section])
    assertion_utils.assert_deep_almost_equal(merged_material.basis, expected_merged_material_basis)
    assertion_utils.assert_deep_almost_equal(merged_material_reverse.basis, expected_merged_material_reverse_basis)
