export function buildEntityEventsQuery(eventsTable: string) {
  return `
    SELECT
      e.id,
      e.source_str AS "sourceStr",
      CONCAT(SPLIT_PART(e.source_str, ':', 2), '-', ent.entity_name) AS "sourceTitle",
      e.start_date AT TIME ZONE 'Asia/Tehran' AS "startDate",  -- Adjusted for Iran Timezone
      e.reception_date AS "receptionDate",
      e.alarms_delay AS "alarmsDelay",
      e.energy_losses AS "energyLosses",
      e.acknowledge_date AS "acknowledgeDate",
      e.acknowledge_comment AS "acknowledgeComment",
      e.acknowledge_status AS "acknowledgeStatus",
      e.status,
      e.state_str AS "stateStr",
      e.severiry_str AS "severityStr",
      e.formal_message AS "descriptionStr",
      CONCAT(u."firstName", ' ', u."lastName") AS "fullName"
    FROM ${eventsTable} e
    LEFT JOIN main.users u ON e.acknowledge_user = u.id
    LEFT JOIN main.entity ent ON e.source_str = ent.entity_tag
    WHERE e.source_str = $1 
    ORDER BY e.id DESC;
  `;
}
