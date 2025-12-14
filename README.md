# tmux config

My tmux configuration.

## Setup

```bash
# Symlink config
ln -sf ~/dev/dot-tmux/tmux.conf ~/.tmux.conf

# Reload
tmux source ~/.tmux.conf
```

## Custom Keybindings

### Vi mode
- `prefix + h/j/k/l` - navigate panes
- `prefix + H/J/K/L` - resize panes
- In copy mode: `v` to select, `y` to yank, `C-v` for rectangle select

### tmux-menus
- `prefix + \` - open command menu

## Plugins

### tmux-menus - Command Menu (inside tmux)

Native popup menus for tmux commands. No fzf required.

**Usage:** Press `prefix + \` to open the menu.

- Pane management (split, resize, swap, kill)
- Window management (create, rename, move)
- Session management (switch, rename, kill)
- Layouts and more

**Install location:** `~/.tmux/plugins/tmux-menus`

**Repo:** https://github.com/jaclu/tmux-menus
