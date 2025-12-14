#!/usr/bin/env bun

const ARROW_RIGHT = "\ue0b0";
const ARROW_LEFT = "\ue0b2";

const colors = {
  bg: "colour236",
  session: "colour226",
  sessionFg: "colour232",
  active: "colour35",
  activeFg: "colour232",
  inactive: "colour240",
  inactiveFg: "colour253",
  activity: "colour179",
  activityFg: "colour232",
  clock: "colour245",
  clockFg: "colour232",
  hostname: "colour39",
  hostnameFg: "colour232",
};

function fg(c: string) {
  return `#[fg=${c}]`;
}

function bg(c: string) {
  return `#[bg=${c}]`;
}

function style(fgColor: string, bgColor: string, bold = false) {
  return `#[fg=${fgColor},bg=${bgColor}${bold ? ",bold" : ""}]`;
}

function arrow(fromBg: string, toBg: string) {
  return `${fg(fromBg)}${bg(toBg)}${ARROW_RIGHT}`;
}

function arrowLeft(fromBg: string, toBg: string) {
  return `${fg(fromBg)}${bg(toBg)}${ARROW_LEFT}`;
}

async function getWindows(
  sessionName: string
): Promise<
  { index: number; name: string; active: boolean; activity: boolean }[]
> {
  const proc = Bun.spawn(
    [
      "tmux",
      "list-windows",
      "-t",
      sessionName,
      "-F",
      "#{window_index}|#{pane_current_command}|#{b:pane_current_path}|#{window_active}|#{window_activity_flag}",
    ],
    { stdout: "pipe" }
  );
  const output = await new Response(proc.stdout).text();
  return output
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [index, cmd, path, active, activity] = line.split("|");
      return {
        index: parseInt(index),
        name: `${cmd}:${path}`,
        active: active === "1",
        activity: activity === "1",
      };
    });
}


async function buildStatusLeft(session: string): Promise<string> {
  const windows = await getWindows(session);
  const firstWindow = windows[0];

  let nextBg = colors.bg;
  if (firstWindow) {
    if (firstWindow.active) nextBg = colors.active;
    else if (firstWindow.activity) nextBg = colors.activity;
    else nextBg = colors.inactive;
  }

  let out = "";
  out += style(colors.sessionFg, colors.session, true);
  out += ` ${session} `;
  out += arrow(colors.session, nextBg);

  return out;
}

async function buildWindows(session: string): Promise<string> {
  const windows = await getWindows(session);
  let out = "";

  for (let i = 0; i < windows.length; i++) {
    const win = windows[i];
    const next = windows[i + 1];

    let winBg: string, winFg: string;
    if (win.active) {
      winBg = colors.active;
      winFg = colors.activeFg;
    } else if (win.activity) {
      winBg = colors.activity;
      winFg = colors.activityFg;
    } else {
      winBg = colors.inactive;
      winFg = colors.inactiveFg;
    }

    let nextBg = colors.bg;
    if (next) {
      if (next.active) nextBg = colors.active;
      else if (next.activity) nextBg = colors.activity;
      else nextBg = colors.inactive;
    }

    out += style(winFg, winBg, win.active);
    out += ` ${win.index} ${win.name} `;
    out += arrow(winBg, nextBg);
  }

  return out;
}

async function buildStatusRight(): Promise<string> {
  const time = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const hostname = process.env.HOSTNAME ?? process.env.HOST ?? null;

  let out = "";
  out += arrowLeft(colors.clock, colors.bg);
  out += style(colors.clockFg, colors.clock);
  out += ` ${time} `;

  if (hostname) {
    out += arrowLeft(colors.hostname, colors.clock);
    out += style(colors.hostnameFg, colors.hostname, true);
    out += ` ${hostname} `;
  }

  return out;
}

const arg = process.argv[2];
const session = process.argv[3];

if (arg === "left") {
  if (!session) {
    console.error("Usage: status.ts left <session>");
    process.exit(1);
  }
  const left = await buildStatusLeft(session);
  const windows = await buildWindows(session);
  process.stdout.write(left + windows);
} else if (arg === "right") {
  process.stdout.write(await buildStatusRight());
} else {
  console.error("Usage: status.ts [left|right] [session]");
  process.exit(1);
}
