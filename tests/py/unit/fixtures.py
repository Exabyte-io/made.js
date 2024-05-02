from typing import Tuple

from ase.build import bulk
from pymatgen.core.interface import Interface
from .utils import atoms_to_interface_structure
from mat3ra.made.tools.build.interface import patch_interface_with_mean_abs_strain

# ASE Atoms fixtures
substrate = bulk("Si", cubic=True)
film = bulk("Cu", cubic=True)
INTERFACE_ATOMS = substrate + film
INTERFACE_ATOMS.set_tags([1] * len(substrate) + [2] * len(film))

# Pymatgen Interface fixtures
INTERFACE_TERMINATION: Tuple = ("Si_termination", "Cu_termination")

interface_structure = atoms_to_interface_structure(INTERFACE_ATOMS)
dict = interface_structure.as_dict()

INTERFACE_STRUCTURE = Interface.from_dict(dict)
# Add properties that are assigned during interface creation in ZSL algorithm
INTERFACE_STRUCTURE.interface_properties["termination"] = INTERFACE_TERMINATION
INTERFACE_STRUCTURE.interface_properties["strain"] = 0.1
INTERFACE_STRUCTURE = patch_interface_with_mean_abs_strain(INTERFACE_STRUCTURE)