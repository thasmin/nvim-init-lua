import * as Solid from "solid-js";
import config, * as constants from "./constants";

import "./style.css";

const App: Solid.Component = () => {
  const [chosen, setChosen] = Solid.createSignal<any>({
    packageManager: "packer",
  });

  Solid.createEffect(() => {
    if (window.location.hash)
      setChosen(JSON.parse(atob(window.location.hash.substring(1))));
  });

  Solid.createEffect(() => {
    window.location.hash = btoa(JSON.stringify(chosen()));
  });

  const finalConfig = Solid.createMemo(() => {
    const pieces = [];
    const current = chosen();

    const pmSlug = current.packageManager;
    const packageManager = config.packageManagers[pmSlug];
    if (packageManager.pre) pieces.push(packageManager.pre);
    config.plugins
      .filter((pl) => current[pl.slug])
      .forEach((pl) => pieces.push("  " + pl.packageManagerCode[pmSlug]));
    if (packageManager.post) pieces.push(packageManager.post);

    pieces.push(constants.baseConfig);
    if (current.leader) pieces.push(`vim.g.mapleader = '${current.leader}'`);
    if (current.indent === "tabs") pieces.push(`vim.o.expandtab = false`);
    if (current.indent === "spaces") pieces.push(`vim.o.expandtab = true`);
    if (current.indent && current.indentSize)
      pieces.push(`vim.o.tabstop = ${current.indentSize}
vim.o.softtabstop = ${current.indentSize}
vim.o.shiftwidth = ${current.indentSize}
`);

    config.plugins
      .filter((pl) => current[pl.slug])
      .forEach((pl) => {
        pieces.push(`-- ${pl.slug}`);
        pieces.push(pl.code);
        pl.options
          .filter((opt) => current[pl.slug][opt.slug])
          .forEach((opt) => pieces.push(opt.code));
      });
    return pieces.join("\n");
  });

  const togglePlugin = (plugin: string, open: boolean) => {
    if (open) {
      if (!chosen()[plugin]) updateChosen({ [plugin]: {} });
    } else {
      updateChosen({ [plugin]: false });
    }
  };

  const updateChosen = (obj: any) => setChosen((ch) => ({ ...ch, ...obj }));

  const toggleOption = (plugin: string, option: string, open: boolean) => {
    const currOpts = chosen()[plugin];
    setChosen((ch) => ({ ...ch, [plugin]: { ...currOpts, [option]: open } }));
  };

  const copyToClipboard = () => {
    const textarea = document.createElement("textarea");
    textarea.value = finalConfig();
    textarea.style.position = "fixed";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };

  return (
    <div>
      <div id="container">
        <div>
          <div style={`float: right`}>
            <button onClick={copyToClipboard}>Copy to Clipboard</button>
          </div>
          <div>Put in ~/.config/nvim/init.lua</div>
          <textarea id="init-lua" readOnly={true}>
            {finalConfig}
          </textarea>
        </div>
        <div style={`margin-left: 5px`}>
          <h2>Package Manager</h2>
          <select
            onInput={(e) =>
              updateChosen({ packageManager: e.currentTarget.value })
            }
          >
            {Object.values(config.packageManagers).map((pm) => (
              <option value={pm.slug}>{pm.name}</option>
            ))}
          </select>

          <h2>Config</h2>
          <div>
            Leader:{" "}
            <input
              style={`width: 20px`}
              maxLength={1}
              value={chosen().leader ?? ""}
              onInput={(e) => updateChosen({ leader: e.currentTarget.value })}
            />
          </div>
          <div>
            Indentation:{" "}
            <select
              value={chosen().indent ?? ""}
              onInput={(e) => updateChosen({ indent: e.currentTarget.value })}
            >
              <option value="">-</option>
              <option value="spaces">Spaces</option>
              <option value="tabs">Tabs</option>
            </select>
            <input
              style={`width: 50px`}
              type="number"
              value={chosen().indentSize ?? ""}
              onInput={(e) =>
                updateChosen({ indentSize: e.currentTarget.value })
              }
            />
          </div>

          <h2>Plugins</h2>
          {config.plugins.map((plugin) => (
            <div className={`plugin ${chosen()[plugin.slug] && "expanded"}`}>
              <div className="header">
                <input
                  type="checkbox"
                  checked={!!chosen()[plugin.slug]}
                  onInput={(e) =>
                    togglePlugin(plugin.slug, e.currentTarget.checked)
                  }
                />
                {plugin.name}
              </div>
              {plugin.options.length > 0 && (
                <div className="extra">
                  {plugin.options.map((opt) => (
                    <div>
                      <input
                        type="checkbox"
                        checked={
                          !!(
                            chosen()[plugin.slug] &&
                            chosen()[plugin.slug][opt.slug]
                          )
                        }
                        onInput={(e) =>
                          toggleOption(
                            plugin.slug,
                            opt.slug,
                            e.currentTarget.checked
                          )
                        }
                      />{" "}
                      {opt.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div id="footer">
        <b>Version 0.0.1</b>. Send me an email at{" "}
        <a href="mailto:dan@axelby.com">mailto:dan@axelby.com</a> with any
        relevant questions, comments, suggestions, etc.
      </div>
    </div>
  );
};

export default App;
