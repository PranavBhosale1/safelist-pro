type ClassValue = string | number | false | null | undefined | { [key: string]: any } | ClassValue[];

export function cn(...classes: ClassValue[]) {
  const res: string[] = [];

  function push(val: ClassValue) {
    if (!val && val !== 0) return;
    if (typeof val === "string" || typeof val === "number") {
      res.push(String(val));
      return;
    }
    if (Array.isArray(val)) {
      val.forEach(push);
      return;
    }
    if (typeof val === "object") {
      for (const k in val) {
        if (Object.prototype.hasOwnProperty.call(val, k) && val[k]) {
          res.push(k);
        }
      }
      return;
    }
  }

  classes.forEach(push);
  return res.join(" ");
}
