export function buildBrowserEntitiesTreeQuery(statusTable: string) {
  return `
    WITH RECURSIVE entity_hierarchy AS (
        SELECT
            e.e_id,
            e.entity_name,
            e.entity_tag,
            e.parent_in_tree_id,
            ARRAY[CASE
                WHEN s.level = 'Major' THEN 3
                WHEN s.status = 'Communicational' THEN 3
                WHEN s.level = 'Minor' THEN 2
                WHEN s.level = 'Warning' THEN 1
                WHEN s.level = 'Normal' THEN 0
                ELSE NULL
            END] AS colors 
        FROM
            main.entity e
        INNER JOIN
            ${statusTable} s
            ON e.entity_tag = s.source_str
        WHERE
            s.source_str IN (
                SELECT entity_tag 
                FROM main.entity es 
                WHERE es.entity_type_id IN (
                    SELECT et_id FROM main.entity_types WHERE plant_id = $1
                )
            )
        UNION ALL
        SELECT
            e.e_id,
            e.entity_name,
            e.entity_tag,
            e.parent_in_tree_id,
            eh.colors || ARRAY[CASE
                WHEN s.level = 'Major' THEN 3
                WHEN s.status = 'Communicational' THEN 3
                WHEN s.level = 'Minor' THEN 2
                WHEN s.level = 'Warning' THEN 1
                WHEN s.level = 'Normal' THEN 0
                ELSE NULL
            END] 
        FROM
            entity_hierarchy eh
        JOIN
            main.entity e
            ON e.e_id = eh.parent_in_tree_id 
        INNER JOIN
            ${statusTable} s
            ON e.entity_tag = s.source_str
    )
    SELECT
        eh.e_id,
        eh.entity_name,
        eh.entity_tag,
        eh.parent_in_tree_id,
        array_agg(DISTINCT unnest_color) AS aggregated_colors, 
        GREATEST(COALESCE(MAX(unnest_color), 0)) AS color
    FROM
        entity_hierarchy eh,
        LATERAL unnest(eh.colors) AS unnest_color
    GROUP BY
        eh.e_id, eh.entity_name, eh.entity_tag, eh.parent_in_tree_id
    ORDER BY
        eh.e_id;
  `;
}
