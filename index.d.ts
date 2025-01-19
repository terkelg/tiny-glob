type Options = {
  cwd?: string;
  dot?: boolean;
  absolute?: boolean;
  filesOnly?: boolean;
  flush?: boolean;
  ignore?: string[];
};

type FilePath = string;

declare function glob(str: string, opts?: Options): Promise<FilePath[]>;

export = glob;
