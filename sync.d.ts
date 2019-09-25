import glob = require("./index.d");

declare function globSync(str: string, opts?: glob.Options): glob.FilePath[];

export = globSync;
