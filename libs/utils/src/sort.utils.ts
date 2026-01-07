export function naturalSortByEntityTag(a: any, b: any): number {
  const ax: any[] = [];
  const bx: any[] = [];

  a.entity_tag.replace(/(\d+)|(\D+)/g, (_: any, $1: string, $2: string) => {
    ax.push([$1 ? Number($1) : Infinity, $2 || '']);
    return '';
  });

  b.entity_tag.replace(/(\d+)|(\D+)/g, (_: any, $1: string, $2: string) => {
    bx.push([$1 ? Number($1) : Infinity, $2 || '']);
    return '';
  });

  while (ax.length && bx.length) {
    const an = ax.shift();
    const bn = bx.shift();
    const diff =
      (an[0] as number) - (bn[0] as number) ||
      (an[1] as string).localeCompare(bn[1] as string);
    if (diff) return diff;
  }

  return ax.length - bx.length;
}
