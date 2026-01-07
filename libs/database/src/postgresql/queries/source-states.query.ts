export function buildEntityStatesQuery(statesTable: string) {
  return `
SELECT
    e.id,
    e.source_str AS "sourceStr",
    CONCAT(SPLIT_PART(e.source_str, ':', 2), '-', ent.entity_name) AS "sourceTitle",
    e.start_date AT TIME ZONE 'Asia/Tehran' AS "startDate",  -- Adjusted for Iran Timezone
    e.reception_date AS "receptionDate",
    e.acknowledge_date AS "acknowledgeDate",
    e.acknowledge_comment AS "acknowledgeComment",
    e.acknowledge_status AS "acknowledgeStatus",
    e.status,
    e.state_str AS "stateStr",
    e.severiry_str AS "severiryStr",
    e.description_str AS "descriptionStr",
    e.ef_id,
    CONCAT(u."firstName", ' ', u."lastName") AS "fullName"
FROM ${statesTable} e
LEFT JOIN main.users u ON e.acknowledge_user = u.id
LEFT JOIN main.entity ent ON e.source_str = ent.entity_tag
WHERE e.source_str = $1
  AND status <> 'notactive'
  AND e.ef_id IN (
      SELECT ef.ef_id
      FROM main.entity ent2
      JOIN main.entity_fields ef ON ent2.entity_type_id = ef.entity_type_id
      WHERE ent2.entity_tag = $1
        AND ef.browser_group LIKE '%State%'
  )
  ORDER BY e.id DESC;
`;
}
