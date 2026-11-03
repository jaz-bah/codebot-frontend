export interface ICommandCard {
    title: string;
    commands: {
      cmd: string;
      desc: string;
    }[];
  }

/* MVC architecture sheets (/dashboard/mvc/*) — see Brain/MVC.md */

export type MvcRole = "model" | "view" | "controller" | "service" | "shared";

/** One line of the framework file tree (MVC.md style). */
export interface IMvcNode {
  /** Folder/file name as shown in the tree (folders end with "/"). */
  name: string;
  /** Inline `#` comment — MVC.md style. */
  note?: string;
  /** MVC layer, colors the note text. */
  role?: MvcRole;
  children?: IMvcNode[];
}
  