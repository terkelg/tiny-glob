export interface Options = {
  cwd?: string;
  dot?: boolean;
  absolute?: boolean;
  filesOnly?: boolean;
  flush?: boolean;
}

export type FilePath = string;

export function glob(str: string, opts?: Options): FilePath[];

declare module "sync" {
  export function glob(str: string, opts?: Options): FilePath[];
}
