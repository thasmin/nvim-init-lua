type PackageManagerOption = "packer";

interface Option {
  slug: string;
  name: string;
  code: string;
}
interface Plugin {
  slug: string;
  name: string;
  description: string;
  homepage: string;
  code: string;
  packageManagerCode: Record<PackageManagerOption, string>;
  options: Option[];
}
interface PackageManager {
  name: string;
  slug: PackageManagerOption;
  pre?: string;
  post?: string;
}
interface Config {
  packageManagers: Record<string, PackageManager>;
  plugins: Plugin[];
}

const packer: PackageManager = {
  slug: "packer",
  name: "Packer",
  pre: "require('packer').startup(function()",
  post: "end)",
};

const nvim_treesitter: Plugin = {
  slug: "nvim-treesitter",
  name: "Nvim-Treesitter",
  description: "Treesitter configurations and abstraction layer.",
  homepage: "https://github.com/nvim-treesitter/nvim-treesitter",
  packageManagerCode: {
    packer: "use {'nvim-treesitter/nvim-treesitter', run = ':TSUpdate'}",
  },
  code: `
local configs = require'nvim-treesitter.configs'
configs.setup {
  ensure_installed = "maintained",
  highlight = {
    enable = true
  },
  indent = {
    enable = true
  }
}`,
  options: [
    {
      name: "Use treesitter for folding",
      slug: "use-for-folding",
      code: `
vim.o.foldmethod = 'expr'
vim.o.foldexpr = 'nvim_treesitter#foldexpr()'
vim.o.foldlevel = 99
`,
    },
  ],
};

const nvim_lspconfig: Plugin = {
  slug: "nvim-lspconfig",
  name: "Nvim-LSPConfig",
  description:
    "A collection of common configurations for Neovim's built-in language server client.",
  homepage: "https://github.com/neovim/nvim-lspconfig",
  packageManagerCode: {
    packer: "use 'neovim/nvim-lspconfig'",
  },
  code: `
local on_attach = function(client, bufnr)
  local function buf_set_keymap(...) vim.api.nvim_buf_set_keymap(bufnr, ...) end
  local function buf_set_option(...) vim.api.nvim_buf_set_option(bufnr, ...) end
  buf_set_option('omnifunc', 'v:lua.vim.lsp.omnifunc')
  local opts = { noremap=true, silent=true }
  vim.api.nvim_buf_set_keymap(bufnr, 'n', 'gD', '<Cmd>lua vim.lsp.buf.declaration()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', 'gd', '<Cmd>lua vim.lsp.buf.definition()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', 'K', '<Cmd>lua vim.lsp.buf.hover()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', 'gi', '<cmd>lua vim.lsp.buf.implementation()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '<C-k>', '<cmd>lua vim.lsp.buf.signature_help()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '<space>wa', '<cmd>lua vim.lsp.buf.add_workspace_folder()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '<space>wr', '<cmd>lua vim.lsp.buf.remove_workspace_folder()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '<space>wl', '<cmd>lua print(vim.inspect(vim.lsp.buf.list_workspace_folders()))<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '<space>D', '<cmd>lua vim.lsp.buf.type_definition()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '<space>rn', '<cmd>lua vim.lsp.buf.rename()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '<space>ca', '<cmd>lua vim.lsp.buf.code_action()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', 'gr', '<cmd>lua vim.lsp.buf.references()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '<space>e', '<cmd>lua vim.lsp.diagnostic.show_line_diagnostics()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '[d', '<cmd>lua vim.lsp.diagnostic.goto_prev()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', ']d', '<cmd>lua vim.lsp.diagnostic.goto_next()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '<space>q', '<cmd>lua vim.lsp.diagnostic.set_loclist()<CR>', opts)
  vim.api.nvim_buf_set_keymap(bufnr, 'n', '<space>f', '<cmd>lua vim.lsp.buf.formatting()<CR>', opts)
end
`,
  options: [],
};

const bufferline: Plugin = {
  slug: "bufferline",
  name: "Bufferline",
  description: "A snazzy buffer line with minimal tab integration.",
  homepage: "https://github.com/akinsho/bufferline.nvim",
  packageManagerCode: {
    packer:
      "use {'akinsho/nvim-bufferline.lua', requires = 'kyazdani42/nvim-web-devicons'}",
  },
  code: `require'bufferline'.setup {
  options = {
    numbers="buffer_id",
    number_style="",
  }
}`,
  options: [
    {
      slug: "left-right-switch-buffers",
      name: "Use Left and Right to switch buffers",
      code: `vim.api.nvim_set_keymap('n', '<Left>', ':bp<CR>', { noremap=true, silent=True })
vim.api.nvim_set_keymap('n', '<Right>', ':bn<CR>', { noremap=true, silent=True })`,
    },
  ],
};

const nvim_tree: Plugin = {
  slug: "nvim-tree",
  name: "Nvim-Tree",
  description: "A file explorer",
  homepage: "https://github.com/kyazdani42/nvim-tree.lua",
  packageManagerCode: {
    packer:
      "use {'kyazdani42/nvim-tree.lua', requires = 'kyazdani42/nvim-web-devicons'}",
  },
  code: "",
  options: [],
};

const telescope: Plugin = {
  slug: "telescope",
  name: "Telescope",
  description: "An extendable fuzzy finder over lists",
  homepage: "https://github.com/nvim-telescope/telescope.nvim",
  packageManagerCode: {
    packer:
      "use {'nvim-telescope/telescope.nvim', requires = {{'nvim-lua/popup.nvim'}, {'nvim-lua/plenary.nvim'}}}",
  },
  code: `require'telescope'.setup {
  defaults = {
    file_ignore_patterns = {"__pycache__", "node_modules"},
  }
}
vim.api.nvim_set_keymap('n', '<C-P>', '<cmd>lua require("telescope.builtin").find_files()<CR>', { noremap=true, silent=True })`,
  options: [],
};

const lspkind: Plugin = {
  slug: "lspkind",
  name: "Lspkind",
  description: "Adds vscode-like pictograms to lsp",
  homepage: "https://github.com/onsails/lspkind-nvim",
  packageManagerCode: {
    packer: "use 'onsails/lspkind-nvim'",
  },
  code: `
require('lspkind').init({
  -- default for nerd-fonts, codicon for vscode-codicons font
  preset = 'default',
})`,
  options: [],
};

const indentBlankline: Plugin = {
  slug: "indent-blankline",
  name: "Indent-blankline",
  homepage: "https://github.com/lukas-reineke/indent-blankline.nvim",
  description: "Adds indentation guides to all lines",
  packageManagerCode: {
    packer: "use 'lukas-reineke/indent-blankline.nvim'",
  },
  code: `
require("indent_blankline").setup {
  char = "|",
  buftype_exclude = {"terminal"}
}`,
  options: [],
};

const config: Config = {
  packageManagers: { packer: packer },
  plugins: [
    nvim_treesitter,
    nvim_lspconfig,
    telescope,
    bufferline,
    nvim_tree,
    lspkind,
    indentBlankline,
  ],
};

export default config;

export const packerConfig = `
-- packer
require('packer').startup(function()
  use 'wbthomason/packer.nvim'
  use {'nvim-treesitter/nvim-treesitter', run = ':TSUpdate'}
  use 'neovim/nvim-lspconfig'
  use {'kyazdani42/nvim-tree.lua', requires = 'kyazdani42/nvim-web-devicons'}
  use {'akinsho/nvim-bufferline.lua', requires = 'kyazdani42/nvim-web-devicons'}
  use {
    'nvim-telescope/telescope.nvim',
    requires = {{'nvim-lua/popup.nvim'}, {'nvim-lua/plenary.nvim'}}
  }
end)`;

export const baseConfig = `
-- config
vim.o.hidden = true
vim.o.termguicolors = true
`;
