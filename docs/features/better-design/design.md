<!-- Blueprint Details - Refined -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Lifecycle Patch Endpoint with Body - Blueprint OS</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Manrope:wght@700;800&amp;family=Fira+Code:wght@400;500&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "secondary-fixed": "#e4e2e2",
                        "tertiary-fixed-dim": "#d2b7e5",
                        "primary-fixed-dim": "#0056e7",
                        "secondary-container": "#e4e2e2",
                        "tertiary-dim": "#604a72",
                        "primary-dim": "#0048c4",
                        "error": "#a83836",
                        "primary": "#0053de",
                        "surface-container": "#eceeee",
                        "on-error-container": "#6e0a12",
                        "error-container": "#fa746f",
                        "surface-container-highest": "#dfe3e4",
                        "on-primary-container": "#ffffff",
                        "tertiary-fixed": "#e1c4f4",
                        "surface": "#f9f9f9",
                        "on-primary-fixed-variant": "#d8dfff",
                        "on-surface-variant": "#5b6061",
                        "secondary": "#5f5f5f",
                        "on-secondary-fixed-variant": "#5b5b5b",
                        "surface-dim": "#d7dbdb",
                        "background": "#f9f9f9",
                        "tertiary": "#6d567f",
                        "on-tertiary": "#fff6fe",
                        "on-background": "#2f3334",
                        "surface-bright": "#f9f9f9",
                        "tertiary-container": "#e1c4f4",
                        "on-tertiary-container": "#523d63",
                        "outline": "#777b7c",
                        "outline-variant": "#afb3b3",
                        "on-tertiary-fixed": "#3e2a4f",
                        "inverse-surface": "#0c0f0f",
                        "on-error": "#fff7f6",
                        "on-secondary": "#fbf8f8",
                        "primary-container": "#0f62fe",
                        "on-primary": "#faf8ff",
                        "on-secondary-container": "#525252",
                        "on-tertiary-fixed-variant": "#5c466d",
                        "surface-container-lowest": "#ffffff",
                        "error-dim": "#67040d",
                        "surface-container-low": "#f2f4f4",
                        "secondary-fixed-dim": "#d6d4d4",
                        "on-secondary-fixed": "#3f3f3f",
                        "secondary-dim": "#535353",
                        "primary-fixed": "#0f62fe",
                        "surface-container-high": "#e6e9e9",
                        "surface-tint": "#0053de",
                        "inverse-on-surface": "#9c9d9d",
                        "on-primary-fixed": "#ffffff",
                        "surface-variant": "#dfe3e4",
                        "on-surface": "#2f3334",
                        "inverse-primary": "#628aff"
                    },
                    fontFamily: {
                        "headline": ["Manrope"],
                        "body": ["Inter"],
                        "label": ["Inter"],
                        "mono": ["Fira Code"]
                    },
                    borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        .code-block {
            line-height: 1.6;
            letter-spacing: 0.02em;
        }
    </style>
</head>
<body class="bg-surface text-on-surface font-body antialiased">
<!-- TopNavBar -->
<header class="fixed top-0 w-full z-50 bg-[#f9f9f9]/80 dark:bg-slate-900/80 backdrop-blur-md shadow-[0_20px_40px_rgba(12,15,15,0.06)]">
<div class="flex justify-between items-center w-full px-8 py-4 max-w-[1440px] mx-auto">
<div class="flex items-center gap-8">
<span class="text-2xl font-black text-[#0F62FE] dark:text-[#3d82ff] tracking-tighter font-headline">Blueprints</span>
<nav class="hidden md:flex gap-6 items-center">
<a class="font-headline font-bold tracking-tight text-[#0F62FE] dark:text-[#3d82ff] border-b-2 border-[#0F62FE] pb-1" href="#">All</a>
<a class="font-headline font-bold tracking-tight text-slate-600 dark:text-slate-400 hover:text-[#0F62FE] transition-colors" href="#">Projects</a>
<a class="font-headline font-bold tracking-tight text-slate-600 dark:text-slate-400 hover:text-[#0F62FE] transition-colors" href="#">Tags</a>
<a class="font-headline font-bold tracking-tight text-slate-600 dark:text-slate-400 hover:text-[#0F62FE] transition-colors" href="#">Admin</a>
</nav>
</div>
<div class="flex items-center gap-4">
<div class="relative group">
<input class="bg-surface-container-high rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64 transition-all" placeholder="Search blueprints..." type="text"/>
</div>
<button class="p-2 hover:bg-[#e6e9e9] dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 duration-200">
<span class="material-symbols-outlined text-on-surface-variant">notifications</span>
</button>
<button class="p-2 hover:bg-[#e6e9e9] dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 duration-200">
<span class="material-symbols-outlined text-on-surface-variant">settings</span>
</button>
<div class="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-all">
<img alt="User Avatar" class="w-full h-full object-cover" data-alt="minimalist professional portrait of a software architect in a bright modern studio setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDr5uZyV2iOg4rN5IzeMnPAkP01nDv5xdg-Khm-0sDxK4Jn6vvbwThf0oVXqjdBBjQW_kP1DmW3qbQ1AJOJF8PBrgQGie8DraScpQ_esPqhOGTTFfS0-kmFEbPcQl4wg3b5uSH8hy7pXbAa09AvtEbtndzlAVNSruKnphOy8nmR2r4qgtg9_zFrLXvOnu4cYV7JZa4xZjn1BJJj8yUfXKTU6kkTyAW3pAyYp5t0srv2H3u4aAe3rVQHkd2BGtkKGRzDwzX9OgZlYh1i"/>
</div>
</div>
</div>
</header>
<main class="pt-32 pb-20 px-8 max-w-[1000px] mx-auto space-y-12">
<!-- Header Section -->
<section class="space-y-6">
<div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
<div class="space-y-2">
<h1 class="text-4xl md:text-5xl font-black font-headline text-on-background tracking-tight">Lifecycle Patch Endpoint with Body</h1>
<p class="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
                        PATCH endpoint with @Param and @Body DTOs, 204 No Content response, and thin delegation to a service lifecycle method.
                    </p>
</div>
<div class="flex gap-2 shrink-0">
<button class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-medium hover:bg-surface-bright transition-all shadow-sm active:scale-95 border-[1px] border-outline-variant/15">
<span class="material-symbols-outlined text-sm">content_copy</span>
                        Copy
                    </button>
<button class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-medium hover:bg-surface-bright transition-all shadow-sm active:scale-95 border-[1px] border-outline-variant/15">
<span class="material-symbols-outlined text-sm">edit</span>
                        Edit
                    </button>
<button class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-error/10 text-error font-medium hover:bg-error/20 transition-all active:scale-95">
<span class="material-symbols-outlined text-sm">delete</span>
                        Delete
                    </button>
</div>
</div>
<!-- Tags -->
<div class="flex gap-3">
<span class="px-4 py-1.5 rounded-full bg-primary-container/10 text-primary text-xs font-bold uppercase tracking-wider">server</span>
<span class="px-4 py-1.5 rounded-full bg-tertiary-container text-on-tertiary-container text-xs font-bold uppercase tracking-wider">controller</span>
<span class="px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold uppercase tracking-wider">shared</span>
</div>
</section>
<!-- When to use -->
<section class="p-8 rounded-full bg-surface-container-low border-[1px] border-outline-variant/15">
<h3 class="font-headline text-xl font-extrabold mb-4 flex items-center gap-2">
<span class="material-symbols-outlined text-primary">info</span>
                When to use
            </h3>
<p class="text-on-surface-variant leading-relaxed">
                Use this blueprint when implementing partial resource updates that require business logic validation within the service layer. It follows the "Thin Controller" pattern, ensuring that the API layer handles request parsing and response codes while the core logic remains decoupled. Ideal for resource state transitions (e.g., publishing a post, activating a user) where the client provides specific update data.
            </p>
</section>
<!-- Reference implementation -->
<section class="space-y-6">
<div class="flex items-center justify-between">
<h3 class="font-headline text-2xl font-extrabold">Reference implementation</h3>
<div class="flex gap-2">
<span class="text-xs font-mono text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">TypeScript</span>
<span class="text-xs font-mono text-on-surface-variant bg-surface-container-high px-2 py-1 rounded">NestJS</span>
</div>
</div>
<div class="rounded-full overflow-hidden bg-inverse-surface shadow-2xl">
<div class="flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm">
<div class="flex gap-1.5">
<div class="w-3 h-3 rounded-full bg-red-500/80"></div>
<div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
<div class="w-3 h-3 rounded-full bg-green-500/80"></div>
</div>
<span class="text-xs text-outline-variant ml-4 font-mono">app.controller.ts</span>
</div>
<div class="p-8 font-mono text-sm code-block text-slate-300 overflow-x-auto">
<pre><code><span class="text-pink-400">@Patch</span>(<span class="text-emerald-400">':id'</span>)
<span class="text-pink-400">@HttpCode</span>(HttpStatus.<span class="text-blue-400">NO_CONTENT</span>)
<span class="text-blue-400">async</span> <span class="text-yellow-400">patchResource</span>(
  <span class="text-pink-400">@Param</span>(<span class="text-emerald-400">'id'</span>) id: <span class="text-orange-400">string</span>,
  <span class="text-pink-400">@Body</span>() updateDto: <span class="text-blue-400">UpdateLifecycleDto</span>
): <span class="text-blue-400">Promise</span>&lt;<span class="text-orange-400">void</span>&gt; {
  <span class="text-blue-400">this</span>.logger.<span class="text-yellow-400">log</span>(<span class="text-emerald-400">`Updating lifecycle for ID: <span class="text-pink-400">${id}</span>`</span>);
  
  <span class="text-blue-400">await</span> <span class="text-blue-400">this</span>.service.<span class="text-yellow-400">patchLifecycle</span>(id, updateDto);
}</code></pre>
</div>
</div>
</section>
<!-- Bento Grid Bottom: Version & Comments -->
<div class="grid md:grid-cols-3 gap-6">
<!-- Version History -->
<div class="md:col-span-1 space-y-4">
<h3 class="font-headline text-xl font-extrabold">Version History</h3>
<div class="bg-surface-container-lowest rounded-full p-1 space-y-1 border-[1px] border-outline-variant/15">
<button class="w-full flex items-center justify-between px-4 py-3 bg-surface-container-low rounded-full text-primary font-bold transition-all">
<div class="flex items-center gap-3">
<span class="text-xs">v1.2.4</span>
<span class="text-[10px] text-on-surface-variant font-normal">Active</span>
</div>
<span class="text-[10px]">24/03/2026</span>
</button>
<button class="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container-low rounded-full text-on-surface-variant font-medium transition-all group">
<div class="flex items-center gap-3">
<span class="text-xs group-hover:text-on-surface">v1.2.3</span>
</div>
<span class="text-[10px]">10/02/2026</span>
</button>
<button class="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-container-low rounded-full text-on-surface-variant font-medium transition-all group">
<div class="flex items-center gap-3">
<span class="text-xs group-hover:text-on-surface">v1.1.0</span>
</div>
<span class="text-[10px]">15/12/2025</span>
</button>
</div>
</div>
<!-- Comments -->
<div class="md:col-span-2 space-y-4">
<h3 class="font-headline text-xl font-extrabold">Comments</h3>
<div class="space-y-4">
<div class="flex gap-4 items-start">
<div class="w-10 h-10 rounded-full bg-tertiary-container overflow-hidden shrink-0">
<img alt="Commenter Avatar" class="w-full h-full object-cover" data-alt="close-up portrait of a developer with glasses in a minimalist tech workspace with blue neon highlights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAG3E3HQKTQsb_WRsmEN_V4np4Bfssga6nXncw2rFQ0IlylfSE9ocqvtFT_vuA236oLPqEiZv3BFLbAPcIgxwGxG0SvxS_cPxa8UvDc6I5XkbV1mrY-oj9SeHot14pTQC6JznfvGnDbMdWIke8HAs08K4YciJrcjktq8Ip69hhJ4X8n5m-4LJ0VC_ypOEAtW9rx-3HvJ0d4JhV_4TbEBbsM7YoOwNXC4U1qyofFezheAYV7ebJ4DraEG-e75iFXRH_PaCxiIY3o2yyZ"/>
</div>
<div class="flex-1 space-y-2">
<div class="bg-surface-container-low p-4 rounded-full rounded-tl-none">
<p class="text-sm leading-relaxed text-on-surface">Should we consider adding a conditional 304 if the resource hasn't changed? Great pattern overall for thin controllers.</p>
</div>
<span class="text-[10px] text-on-surface-variant font-medium ml-1">Sarah Chen • 2 hours ago</span>
</div>
</div>
<!-- Input Area -->
<div class="bg-surface-container-lowest p-4 rounded-full border-[1px] border-outline-variant/15 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
<textarea class="w-full bg-transparent border-none focus:ring-0 text-sm resize-none" placeholder="Share your thoughts on this implementation..." rows="2"></textarea>
<div class="flex justify-end mt-2">
<button class="bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-bold shadow-sm hover:translate-y-[-1px] transition-all active:scale-95">
                                Post
                            </button>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Side Navigation Placeholder (Hidden on small screens) -->
<aside class="hidden xl:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#e6e9e9] dark:bg-slate-900 p-4 space-y-2 pt-24">
<div class="px-4 py-2 mb-4">
<h2 class="text-lg font-bold text-slate-900 dark:text-white font-headline">Blueprint OS</h2>
<p class="text-[10px] text-slate-500 font-medium tracking-widest uppercase">v2.4.0</p>
</div>
<a class="flex items-center gap-3 px-4 py-3 bg-[#ffffff] dark:bg-slate-800 text-[#0F62FE] dark:text-white rounded-l-xl shadow-sm hover:translate-x-1 transition-all" href="#">
<span class="material-symbols-outlined">architecture</span>
<span class="text-sm font-medium font-body">Blueprints</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-1 transition-all" href="#">
<span class="material-symbols-outlined">database</span>
<span class="text-sm font-medium font-body">Repository</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-1 transition-all" href="#">
<span class="material-symbols-outlined">query_stats</span>
<span class="text-sm font-medium font-body">Analytics</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-1 transition-all" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="text-sm font-medium font-body">Settings</span>
</a>
<div class="mt-auto space-y-2 border-t border-outline-variant/10 pt-4">
<button class="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 transition-all">
<span class="material-symbols-outlined">description</span>
<span class="text-sm font-medium font-body">Documentation</span>
</button>
<button class="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:text-error transition-all">
<span class="material-symbols-outlined">logout</span>
<span class="text-sm font-medium font-body">Sign Out</span>
</button>
</div>
</aside>
<!-- FAB Suppression: Details screen doesn't require a global FAB -->
</body></html>

<!-- Search Results - Refined -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Search Results: modification endpoint | Blueprints</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          colors: {
            "secondary-fixed": "#e4e2e2",
            "tertiary-fixed-dim": "#d2b7e5",
            "primary-fixed-dim": "#0056e7",
            "secondary-container": "#e4e2e2",
            "tertiary-dim": "#604a72",
            "primary-dim": "#0048c4",
            "error": "#a83836",
            "primary": "#0053de",
            "surface-container": "#eceeee",
            "on-error-container": "#6e0a12",
            "error-container": "#fa746f",
            "surface-container-highest": "#dfe3e4",
            "on-primary-container": "#ffffff",
            "tertiary-fixed": "#e1c4f4",
            "surface": "#f9f9f9",
            "on-primary-fixed-variant": "#d8dfff",
            "on-surface-variant": "#5b6061",
            "secondary": "#5f5f5f",
            "on-secondary-fixed-variant": "#5b5b5b",
            "surface-dim": "#d7dbdb",
            "background": "#f9f9f9",
            "tertiary": "#6d567f",
            "on-tertiary": "#fff6fe",
            "on-background": "#2f3334",
            "surface-bright": "#f9f9f9",
            "tertiary-container": "#e1c4f4",
            "on-tertiary-container": "#523d63",
            "outline": "#777b7c",
            "outline-variant": "#afb3b3",
            "on-tertiary-fixed": "#3e2a4f",
            "inverse-surface": "#0c0f0f",
            "on-error": "#fff7f6",
            "on-secondary": "#fbf8f8",
            "primary-container": "#0f62fe",
            "on-primary": "#faf8ff",
            "on-secondary-container": "#525252",
            "on-tertiary-fixed-variant": "#5c466d",
            "surface-container-lowest": "#ffffff",
            "error-dim": "#67040d",
            "surface-container-low": "#f2f4f4",
            "secondary-fixed-dim": "#d6d4d4",
            "on-secondary-fixed": "#3f3f3f",
            "secondary-dim": "#535353",
            "primary-fixed": "#0f62fe",
            "surface-container-high": "#e6e9e9",
            "surface-tint": "#0053de",
            "inverse-on-surface": "#9c9d9d",
            "on-primary-fixed": "#ffffff",
            "surface-variant": "#dfe3e4",
            "on-surface": "#2f3334",
            "inverse-primary": "#628aff"
          },
          fontFamily: {
            "headline": ["Manrope"],
            "body": ["Inter"],
            "label": ["Inter"]
          },
          borderRadius: {"DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem"},
        },
      },
    }
  </script>
<style>
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    body { font-family: 'Inter', sans-serif; }
    h1, h2, h3 { font-family: 'Manrope', sans-serif; }
  </style>
</head>
<body class="bg-surface text-on-surface">
<!-- TopNavBar (Shared Component) -->
<nav class="fixed top-0 w-full z-50 bg-[#f9f9f9]/80 dark:bg-slate-900/80 backdrop-blur-md shadow-[0_20px_40px_rgba(12,15,15,0.06)]">
<div class="flex justify-between items-center w-full px-8 py-4 max-w-[1440px] mx-auto">
<div class="flex items-center gap-8">
<span class="text-2xl font-black text-[#0F62FE] dark:text-[#3d82ff] tracking-tighter">Blueprints</span>
<div class="hidden md:flex gap-6">
<a class="font-['Manrope'] font-bold tracking-tight text-slate-600 dark:text-slate-400 hover:text-[#0F62FE] transition-colors" href="#">All</a>
<a class="font-['Manrope'] font-bold tracking-tight text-[#0F62FE] dark:text-[#3d82ff] border-b-2 border-[#0F62FE] pb-1" href="#">Projects</a>
<a class="font-['Manrope'] font-bold tracking-tight text-slate-600 dark:text-slate-400 hover:text-[#0F62FE] transition-colors" href="#">Tags</a>
<a class="font-['Manrope'] font-bold tracking-tight text-slate-600 dark:text-slate-400 hover:text-[#0F62FE] transition-colors" href="#">Admin</a>
</div>
</div>
<div class="flex items-center gap-4">
<button class="p-2 hover:bg-[#e6e9e9] dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 duration-200 ease-in-out">
<span class="material-symbols-outlined text-slate-600 dark:text-slate-400">notifications</span>
</button>
<button class="p-2 hover:bg-[#e6e9e9] dark:hover:bg-slate-800 rounded-lg transition-all active:scale-95 duration-200 ease-in-out">
<span class="material-symbols-outlined text-slate-600 dark:text-slate-400">settings</span>
</button>
<img alt="User Avatar" class="w-8 h-8 rounded-full border border-outline-variant/20" data-alt="Professional headshot of a developer in a modern studio setting with soft natural lighting and a neutral background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAO7paiAXtYDUFGVO-I2E3H3AJmvpn5mZRO6q6BKEUnIV7o809RZhBXw9pnTnA7jPhnhW_iuTOBnmWgvH7MXqluzmj0rXkI_LOu6ol6Ir3ujAqy29OKlabH-zynURkz8nq0YKSH3HZNlueoxy7NYU_8Cc-iU5xkG0A5n_xXdTuqU4NmRFOXOTmA4akSzwLnrKTO7x544CNaJe-5o3LNXWpYc9cfVX3uvGV5isVx0hjE6C9OJPyt_M6lKPq2_ZoSk2NfSqGLkwzYA2_X"/>
</div>
</div>
</nav>
<main class="pt-28 pb-20 px-8 max-w-[1440px] mx-auto">
<!-- Search Hero Section -->
<header class="mb-12">
<div class="max-w-4xl">
<h1 class="text-5xl font-extrabold tracking-tight mb-8 text-on-surface">
          Search results for <span class="text-primary italic">"modification endpoint"</span>
</h1>
<div class="flex flex-col md:flex-row gap-4">
<div class="relative flex-grow group">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
<input class="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all text-lg font-medium outline-none" placeholder="Search your blueprints repository..." type="text" value="modification endpoint"/>
</div>
<div class="flex gap-2">
<button class="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl active:scale-95 transition-transform shadow-md">
              Search
            </button>
<button class="px-8 py-4 bg-surface-container-lowest text-secondary font-semibold rounded-xl hover:bg-surface-bright active:scale-95 transition-all border border-outline-variant/10">
              Clear
            </button>
</div>
</div>
</div>
</header>
<!-- Filter Bar -->
<section class="flex flex-wrap items-center gap-6 mb-12 py-6 border-y border-outline-variant/10">
<div class="flex items-center gap-2">
<span class="text-xs font-bold uppercase tracking-widest text-outline">Filter by</span>
</div>
<div class="flex gap-3 overflow-x-auto pb-2 md:pb-0">
<button class="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full text-sm font-semibold hover:bg-surface-container-highest transition-colors">
<span>All stacks</span>
<span class="material-symbols-outlined text-sm">expand_more</span>
</button>
<button class="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full text-sm font-semibold hover:bg-surface-container-highest transition-colors">
<span>Filter by layer</span>
<span class="material-symbols-outlined text-sm">expand_more</span>
</button>
<button class="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-full text-sm font-semibold hover:bg-surface-container-highest transition-colors">
<span>Filter by tag</span>
<span class="material-symbols-outlined text-sm">expand_more</span>
</button>
</div>
<div class="ml-auto text-sm text-outline font-medium">
        Showing 8 of 142 blueprints
      </div>
</section>
<!-- Grid of Blueprint Cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
<!-- Card 1 -->
<div class="group bg-surface-container-lowest p-6 rounded-xl hover:bg-surface-bright transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_40px_rgba(12,15,15,0.02)] hover:shadow-[0_20px_40px_rgba(12,15,15,0.06)]">
<div class="flex justify-between items-start mb-4">
<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">architecture</span>
</div>
<span class="px-2 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full">33% Match</span>
</div>
<h3 class="text-lg font-bold mb-2 group-hover:text-primary transition-colors">Lifecycle Patch Endpoint with Body</h3>
<p class="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-2">A high-performance patch implementation for handling complex state modifications across cluster lifecycle events.</p>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-full">server</span>
<span class="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-full">controller</span>
</div>
</div>
<!-- Card 2 -->
<div class="group bg-surface-container-lowest p-6 rounded-xl hover:bg-surface-bright transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_40px_rgba(12,15,15,0.02)] hover:shadow-[0_20px_40px_rgba(12,15,15,0.06)]">
<div class="flex justify-between items-start mb-4">
<div class="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined">database</span>
</div>
<span class="px-2 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full">22% Match</span>
</div>
<h3 class="text-lg font-bold mb-2 group-hover:text-primary transition-colors">Decimal Schema Field</h3>
<p class="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-2">Modification template for injecting precise decimal support into existing repository schemas.</p>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-full">shared</span>
</div>
</div>
<!-- Card 3 -->
<div class="group bg-surface-container-lowest p-6 rounded-xl hover:bg-surface-bright transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_40px_rgba(12,15,15,0.02)] hover:shadow-[0_20px_40px_rgba(12,15,15,0.06)]">
<div class="flex justify-between items-start mb-4">
<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">api</span>
</div>
<span class="px-2 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full">18% Match</span>
</div>
<h3 class="text-lg font-bold mb-2 group-hover:text-primary transition-colors">Bulk Modification Handler</h3>
<p class="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-2">Optimized endpoint logic for processing multiple resource modifications in a single atomic transaction.</p>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-full">server</span>
</div>
</div>
<!-- Card 4 -->
<div class="group bg-surface-container-lowest p-6 rounded-xl hover:bg-surface-bright transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_40px_rgba(12,15,15,0.02)] hover:shadow-[0_20px_40px_rgba(12,15,15,0.06)]">
<div class="flex justify-between items-start mb-4">
<div class="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
<span class="material-symbols-outlined">security</span>
</div>
<span class="px-2 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full">15% Match</span>
</div>
<h3 class="text-lg font-bold mb-2 group-hover:text-primary transition-colors">Authenticated Put Endpoint</h3>
<p class="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-2">Standardized pattern for secure resource modification with integrated RBAC middleware.</p>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-full">controller</span>
<span class="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-full">shared</span>
</div>
</div>
<!-- Card 5 -->
<div class="group bg-surface-container-lowest p-6 rounded-xl hover:bg-surface-bright transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_40px_rgba(12,15,15,0.02)] hover:shadow-[0_20px_40px_rgba(12,15,15,0.06)]">
<div class="flex justify-between items-start mb-4">
<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">data_object</span>
</div>
<span class="px-2 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full">12% Match</span>
</div>
<h3 class="text-lg font-bold mb-2 group-hover:text-primary transition-colors">JSON Patch Adapter</h3>
<p class="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-2">Utility for converting generic HTTP patch requests into domain-specific modification commands.</p>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-full">shared</span>
</div>
</div>
<!-- Card 6 -->
<div class="group bg-surface-container-lowest p-6 rounded-xl hover:bg-surface-bright transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_40px_rgba(12,15,15,0.02)] hover:shadow-[0_20px_40px_rgba(12,15,15,0.06)]">
<div class="flex justify-between items-start mb-4">
<div class="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined">webhook</span>
</div>
<span class="px-2 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full">9% Match</span>
</div>
<h3 class="text-lg font-bold mb-2 group-hover:text-primary transition-colors">Async Update Webhook</h3>
<p class="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-2">Callback endpoint blueprint for receiving asynchronous modification status updates from remote nodes.</p>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-full">server</span>
</div>
</div>
<!-- Card 7 -->
<div class="group bg-surface-container-lowest p-6 rounded-xl hover:bg-surface-bright transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_40px_rgba(12,15,15,0.02)] hover:shadow-[0_20px_40px_rgba(12,15,15,0.06)]">
<div class="flex justify-between items-start mb-4">
<div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
<span class="material-symbols-outlined">bolt</span>
</div>
<span class="px-2 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full">7% Match</span>
</div>
<h3 class="text-lg font-bold mb-2 group-hover:text-primary transition-colors">Rapid Field Modifier</h3>
<p class="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-2">A lightweight controller pattern specifically for single-field property updates with minimal overhead.</p>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-full">controller</span>
</div>
</div>
<!-- Card 8 -->
<div class="group bg-surface-container-lowest p-6 rounded-xl hover:bg-surface-bright transition-all duration-300 hover:-translate-y-1 shadow-[0_20px_40px_rgba(12,15,15,0.02)] hover:shadow-[0_20px_40px_rgba(12,15,15,0.06)]">
<div class="flex justify-between items-start mb-4">
<div class="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
<span class="material-symbols-outlined">history</span>
</div>
<span class="px-2 py-1 bg-tertiary-container text-on-tertiary-container text-xs font-bold rounded-full">5% Match</span>
</div>
<h3 class="text-lg font-bold mb-2 group-hover:text-primary transition-colors">Revisioning Wrapper</h3>
<p class="text-sm text-on-surface-variant leading-relaxed mb-6 line-clamp-2">Middle-layer logic that automatically snapshots resource state before applying endpoint modifications.</p>
<div class="flex flex-wrap gap-2">
<span class="px-3 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider rounded-full">shared</span>
</div>
</div>
</div>
<!-- Pagination/Load More (Simplified for aesthetic) -->
<div class="mt-16 flex justify-center">
<button class="flex items-center gap-2 px-8 py-3 bg-surface-container-high text-secondary font-bold rounded-full hover:bg-surface-container-highest transition-all group active:scale-95">
<span>Load More Blueprints</span>
<span class="material-symbols-outlined group-hover:translate-y-1 transition-transform">expand_more</span>
</button>
</div>
</main>
<!-- Side Navigation Overlay (Simulated context from JSON but suppressed as per shell rules for focus) -->
<!-- Note: Suppression logic applied - this is a search result page, we prioritize the content canvas -->
</body></html>