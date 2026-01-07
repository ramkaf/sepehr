export interface IDeviceParameterResult {
  e_uuid: string;
  e_e_id: number;
  e_entity_name: string;
  e_entity_tag: string;
  e_parent_in_tree_id: number;
  e_entity_type_id: number;

  et_et_id: number;
  et_name: string;
  et_tag: string;
  et_description: string | null;
  et_abstraction_level: string;
  et_plant_id: number;
  et_uuid: string;

  ef_ef_id: number;
  ef_field_title: string;
  ef_field_tag: string;
  ef_unit: string;
  ef_is_computational: boolean;
  ef_last_value_function_name: string | null;
  ef_all_values_function_name: string | null;
  ef_is_static: boolean;
  ef_static_value: string;
  ef_mask_function: string | null;
  ef_field_type: string;
  ef_default_cache_value: string | null;
  ef_entity_type_id: number;
  ef_ac_id: number | null;
  ef_uuid: string;

  period_function_name: string | null;
  period_range_value: number | null;
  period_range_type: string | null;
  period_id: number | null;

  bookmark: string | null; // could also be Date if you want to map it later
  description: string | null;
}
