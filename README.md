# Your new game project #

Start by forking or cloning this repo and open it with Visual Studio Code.

## Preparing your build ##

- Enter your terminal (View > Integrated Terminal) and prepare:

```bash
npm install
```

- Go to Preferences > Keyboard Shortcuts and paste this:

```json
{ "key": "alt+l", "command": "workbench.action.tasks.runTask", "args": "launch" }
```

- Install [Love2d Snippets](https://marketplace.visualstudio.com/items?itemName=pixelwar.love2dsnippets), which makes your life easier.

## Tasks ##

### ALT+L (Launch) ###

Starts the game at the src directory. If it does not, please check the contents of _launch.sh_ (UNIX) / _launch.bat_ (WINDOWS) and adjust.

### `gulp minify-lua` ###

Uses [luamin](https://github.com/mathiasbynens/luamin) to compress copies of your lua files, that will be put in the _dist_ folder.

### `gulp merge-animations` ###

Will combine _*.ani.png_ files into _*.a.png_ files. Each file will be a row in the output file. Files will be grouped by the part before the first underscore \_ of the source filename.

Example: _sample_move0.ani.png_, _sample_move1.ani.png_, _sample_move2.ani.png_, _sample_move3.ani.png_ will be converted to _sample.a.png_.

### `gulp build` ###

Does all tasks above, except for the launch task.

### `gulp` / `gulp default` ###

Builds once and starts the watcher on all files to trigger specific tasks, automatically. Should be used before starting your programming session.