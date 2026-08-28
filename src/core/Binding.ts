export interface Binding<T> {
  read(): T;
  write(v: T): void;
  equals(a: T, b: T): boolean;
  readonly target: object | null;
  readonly key: string | null;
}

export function bindKey<T>(target: any, key: string, equals: (a: T, b: T) => boolean = Object.is): Binding<T> {
  return {
    target, key, equals,
    read: () => target[key] as T,
    write: (v) => { target[key] = v; },
  };
}

export function bindValue<T>(initial: T, equals: (a: T, b: T) => boolean = Object.is): Binding<T> {
  let v = initial;
  return { target: null, key: null, equals, read: () => v, write: (n) => { v = n; } };
}

export interface XY { x: number; y: number }
export const xyEquals = (a: XY, b: XY): boolean => a.x === b.x && a.y === b.y;

/** two-key form: addPad2D(obj, 'x', 'y') — writes both keys, never replaces the object */
export function bindXY(target: any, xKey: string, yKey: string): Binding<XY> {
  return {
    target, key: `${xKey},${yKey}`, equals: xyEquals,
    read: () => ({ x: target[xKey], y: target[yKey] }),
    write: (v) => { target[xKey] = v.x; target[yKey] = v.y; },
  };
}

/** object form: addPad2D(obj, 'offset') where obj.offset = {x,y}; mutates in place */
export function bindXYObject(target: any, key: string): Binding<XY> {
  return {
    target, key, equals: xyEquals,
    read: () => ({ x: target[key].x, y: target[key].y }),
    write: (v) => { target[key].x = v.x; target[key].y = v.y; },
  };
}

export const structuralEquals = (a: unknown, b: unknown): boolean => JSON.stringify(a) === JSON.stringify(b);
