import * as Solid from "solid-js";
import config, * as constants from "./constants";

import "./style.scss";
import iconLinkout from "./assets/linkout.svg";

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
    document.getElementById("finalConfig").textContent = finalConfig();
    //@ts-ignore
    hljs.highlightAll();
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
          .filter((opt) => current[pl.slug].includes(opt.slug))
          .forEach((opt) => pieces.push(opt.code));
      });
    return pieces.join("\n");
  });

  const togglePlugin = (plugin: string, open: boolean) => {
    if (open) {
      if (!chosen()[plugin]) updateChosen({ [plugin]: [] });
    } else {
      const { [plugin]: omit, ...rest } = chosen();
      setChosen(rest);
    }
  };

  const updateChosen = (obj: any) => setChosen((ch) => ({ ...ch, ...obj }));

  const toggleOption = (plugin: string, option: string, open: boolean) => {
    const currOpts = chosen()[plugin];
    if (open) setChosen((ch) => ({ ...ch, [plugin]: [...currOpts, option] }));
    else
      setChosen((ch) => ({
        ...ch,
        [plugin]: currOpts.filter((opt) => opt != option),
      }));
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
        <div id="left-side">
          <div id="left-top">
            <b>Put in ~/.config/nvim/init.lua</b>
            <div style={`float: right`}>
              <button onClick={copyToClipboard}>Copy to Clipboard</button>
            </div>
          </div>
          <pre>
            <code class="language-lua" id="finalConfig"></code>
          </pre>
        </div>
        <div id="divider"></div>
        <div id="right-side">
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
            <div class={`plugin ${plugin.slug} `}>
              <div class="header">
                <div class="checkbox">
                  <input
                    type="checkbox"
                    checked={!!chosen()[plugin.slug]}
                    onInput={(e) =>
                      togglePlugin(plugin.slug, e.currentTarget.checked)
                    }
                  />
                </div>
                <div>
                  <div class="pluginName">
                    <b>{plugin.name}</b>
                    <a target="_blank" href={plugin.homepage}>
                      <img src={iconLinkout} class="homepageLink" style="" />
                    </a>
                  </div>
                  <div class="pluginDescription">{plugin.description}</div>
                </div>
              </div>
              {plugin.options.length > 0 && (
                <div
                  class={`options ${chosen()[plugin.slug] ? "expanded" : ""}`}
                >
                  {plugin.options.map((opt) => (
                    <div style="display: flex; align-items: center">
                      <input
                        type="checkbox"
                        style="margin-right: 5px"
                        checked={
                          !!(
                            chosen()[plugin.slug] &&
                            chosen()[plugin.slug].includes(opt.slug)
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
        <b>Version 0.1.0</b>. Send me an email at (dan at axelby dot com) with
        any questions, comments, suggestions, etc.
      </div>
    </div>
  );
};

export default App;
