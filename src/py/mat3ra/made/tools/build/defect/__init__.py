from typing import Optional

from mat3ra.made.material import Material
from .builders import VacancyBuilder, SubstitutionBuilder, InterstitialBuilder, PointDefectBuilderParameters
from .configuration import PointDefectConfiguration
from .enums import PointDefectTypeEnum


def DEFECT_BUILDER_FACTORY(builder_parameters):
    return {
        PointDefectTypeEnum.VACANCY: VacancyBuilder(builder_parameters),
        PointDefectTypeEnum.SUBSTITUTION: SubstitutionBuilder(builder_parameters),
        PointDefectTypeEnum.INTERSTITIAL: InterstitialBuilder(builder_parameters),
    }


def create_defect(
    configuration: PointDefectConfiguration,
    builder_parameters: Optional[PointDefectBuilderParameters] = None,
) -> Material:
    """
    Return a material with a selected defect added.

    Args:
        configuration: The configuration of the defect to be added.
        builder_parameters: The parameters to be used by the defect builder.

    Returns:
        The material with the defect added.
    """
    builder = DEFECT_BUILDER_FACTORY(builder_parameters)[configuration.defect_type]

    return builder.get_material(configuration) if builder else configuration.crystal
