import { defineConfig, presetAttributify, presetUno } from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  theme: {
    colors: {
      brand: '#2f6bff',
      brandsoft: '#eaf1ff',
    },
  },
  // 动态拼接的色板（红绿灯）放进 safelist，确保按需生成
  safelist: [
    'bg-red-50',
    'text-red-600',
    'border-red-200',
    'bg-amber-50',
    'text-amber-600',
    'border-amber-200',
    'bg-slate-50',
    'text-slate-600',
    'border-slate-200',
    'bg-slate-200',
    'text-slate-600',
    'border-slate-300',
    'bg-blue-50',
    'text-blue-600',
    'border-blue-200',
    'bg-emerald-50',
    'text-emerald-600',
    'border-emerald-200',
    'bg-brandsoft',
  ],
});
