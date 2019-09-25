declare namespace glob {
  interface Options {
    cwd?: string;
    dot?: boolean;
    absolute?: boolean;
    filesOnly?: boolean;
    flush?: boolean;
  }
  
  type FilePath = string;
}

declare function glob(str: string, opts?: glob.Options): Promise<glob.FilePath[]>;

export = glob;
