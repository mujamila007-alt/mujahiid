/* LiquidGlass SVG Icon + Emoji Upgrade
   Visual only: no business logic changed. Optimized for dynamic content.
   v4: mobile performance guard to avoid frame drops on phones. */
(function () {
  'use strict';

  function isMobilePerfMode() {
    try {
      var smallScreen = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
      var lowCpu = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
      var lowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;
      var coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      return !!(smallScreen || (coarsePointer && (lowCpu || lowMemory)));
    } catch (e) { return false; }
  }

  function line(paths, viewBox) {
    return '<svg class="liquid-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="' + (viewBox || '0 0 24 24') + '" aria-hidden="true" focusable="false">' + paths + '</svg>';
  }
  function solid(paths, viewBox) {
    return '<svg class="liquid-svg-icon liquid-svg-solid" fill-mode="solid" xmlns="http://www.w3.org/2000/svg" viewBox="' + (viewBox || '0 0 24 24') + '" aria-hidden="true" focusable="false">' + paths + '</svg>';
  }

  var ICONS = {
    home: line('<path d="M3 10.8 12 3l9 7.8"/><path d="M5 10v10h14V10"/><path d="M9.5 20v-6h5v6"/>'),
    search: line('<circle cx="11" cy="11" r="7"/><path d="m20 20-4.2-4.2"/>'),
    cart: line('<path d="M6 6h15l-1.5 8.5a2 2 0 0 1-2 1.5H9a2 2 0 0 1-2-1.5L5 3H2"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/>'),
    user: line('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    users: line('<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    userPlus: line('<circle cx="10" cy="8" r="4"/><path d="M3 21a7 7 0 0 1 14 0"/><path d="M19 8v6"/><path d="M16 11h6"/>'),
    userCheck: line('<circle cx="10" cy="8" r="4"/><path d="M3 21a7 7 0 0 1 14 0"/><path d="m17 11 2 2 4-5"/>'),
    userClock: line('<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 12.5-4.3"/><circle cx="18" cy="17" r="4"/><path d="M18 15v2l1.5 1"/>'),
    mail: line('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>'),
    whatsapp: solid('<path d="M20.5 3.5A11.6 11.6 0 0 0 2.8 18.1L2 22l4-1a11.5 11.5 0 0 0 5.5 1.4h.1A11.5 11.5 0 0 0 20.5 3.5Zm-8.9 16.7h-.1a9.5 9.5 0 0 1-4.8-1.3l-.3-.2-2.4.6.6-2.3-.2-.3a9.5 9.5 0 1 1 7.2 3.5Zm5.2-7.1c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.6-1.6-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2.1-.4 0-.5 0-.1-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3 4.8 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.3-.6-.4Z"/>'),
    chart: line('<path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 3-3 3 2 5-7"/>'),
    clock: line('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    key: line('<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8"/><path d="m15 4 2 2"/><path d="m13 6 2 2"/>'),
    send: line('<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>'),
    cog: line('<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1h.2a2 2 0 0 1 0 4h-.2a1.7 1.7 0 0 0-1.4 1Z"/>'),
    logout: line('<path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 3v18h-7"/>'),
    bars: line('<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>'),
    refresh: line('<path d="M21 12a9 9 0 0 1-15.4 6.4L3 16"/><path d="M3 21v-5h5"/><path d="M3 12A9 9 0 0 1 18.4 5.6L21 8"/><path d="M21 3v5h-5"/>'),
    plus: line('<path d="M12 5v14"/><path d="M5 12h14"/>'),
    check: line('<path d="m20 6-11 11-5-5"/>'),
    x: line('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
    warning: line('<path d="M10.3 4.3 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
    info: line('<circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
    history: line('<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/>'),
    list: line('<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/>'),
    code: line('<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>'),
    eye: line('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
    link: line('<path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1"/>'),
    save: line('<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/>'),
    copy: line('<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    edit: line('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
    trash: line('<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 15H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>'),
    mobile: line('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'),
    inbox: line('<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 4h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6Z"/>'),
    shield: line('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>'),
    lock: line('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    bolt: solid('<path d="M13 2 3 14h7l-1 8 10-12h-7l1-8Z"/>'),
    rocket: line('<path d="M4.5 16.5c-1 1-1.5 3-1.5 4.5 1.5 0 3.5-.5 4.5-1.5"/><path d="M9 15 7 17"/><path d="M15 9l2-2"/><path d="M8 16s1-6 5-10c3.2-3.2 6.4-3.6 8-3-.6 1.6-.2 4.8-3 8-4 4-10 5-10 5Z"/><path d="M14 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/>'),
    arrowLogin: line('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>'),
    arrowUpRight: line('<path d="M7 17 17 7"/><path d="M7 7h10v10"/>'),
    arrowDown: line('<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>'),
    calendar: line('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>'),
    calendarPlus: line('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M12 14v5"/><path d="M9.5 16.5h5"/>'),
    calendarX: line('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="m10 14 4 4"/><path d="m14 14-4 4"/>'),
    stop: line('<circle cx="12" cy="12" r="9"/><rect x="9" y="9" width="6" height="6" rx="1"/>'),
    tag: line('<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><path d="M7.5 7.5h.01"/>'),
    sparkle: line('<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9Z"/>'),
    gift: line('<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13"/><path d="M3 12h18"/><path d="M7.5 8A2.5 2.5 0 1 1 12 6c0 1.5-2 2-4.5 2Z"/><path d="M16.5 8A2.5 2.5 0 1 0 12 6c0 1.5 2 2 4.5 2Z"/>'),
    trophy: line('<path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0Z"/><path d="M5 5H3v3a4 4 0 0 0 4 4"/><path d="M19 5h2v3a4 4 0 0 1-4 4"/>'),
    crown: line('<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5Z"/><path d="M5 19h14"/>'),
    bulb: line('<path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.5 14A6 6 0 1 1 15.5 14c-.7.6-1.2 1.5-1.4 2.5h-4.2c-.2-1-.7-1.9-1.4-2.5Z"/>'),
    chat: line('<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8"/><path d="M8 13h5"/>'),
    money: line('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9v.01"/><path d="M18 15v.01"/>'),
    folder: line('<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>'),
    file: line('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>'),
    clipboard: line('<rect x="8" y="3" width="8" height="4" rx="1"/><path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/>'),
    pin: line('<path d="m12 17-5 5 2-7-5-5 7-.5L14 3l3 6.5 7 .5-5 5 2 7Z"/>'),
    download: line('<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>'),
    package: line('<path d="m21 8-9-5-9 5 9 5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>'),
    camera: line('<path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z"/><circle cx="12" cy="13" r="4"/>'),
    phone: line('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.7 9.8a16 16 0 0 0 6.5 6.5l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 1.7 2Z"/>'),
    location: line('<path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z"/><circle cx="12" cy="10" r="3"/>'),
    robot: line('<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4"/><path d="M8 13h.01"/><path d="M16 13h.01"/><path d="M9 17h6"/>'),
    target: line('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'),
    card: line('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/>'),
    store: line('<path d="M4 10h16l-1-5H5Z"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/><path d="M4 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/>'),
    coffee: line('<path d="M4 8h11v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z"/><path d="M15 10h2a3 3 0 0 1 0 6h-2"/><path d="M6 2v3"/><path d="M10 2v3"/>'),
    medal: line('<path d="M8 2h8l-2 7h-4Z"/><circle cx="12" cy="15" r="5"/><path d="m10.5 15 1 1 2-2"/>'),
    fire: solid('<path d="M13 2s1 3-1.4 5.4C9.8 9.1 8 10.7 8 13a4 4 0 0 0 8 0c0-1.5-.7-2.7-1.4-3.7 2.2 1.1 4.4 3.2 4.4 6.2A7 7 0 0 1 5 15.5c0-4 3-6.4 5-8.7C11.7 4.8 13 2 13 2Z"/>'),
    status: solid('<circle cx="12" cy="12" r="8"/>')
  };

  var GLYPH_ICON_MAP = Object.create(null);
  function glyph(code, key) { GLYPH_ICON_MAP[String.fromCodePoint(code)] = key; }
  [0x2705,0x2713,0x2714,0x1F44C].forEach(function(c){ glyph(c, 'check'); });
  [0x274C,0x2715,0x2716].forEach(function(c){ glyph(c, 'x'); });
  [0x26A0].forEach(function(c){ glyph(c, 'warning'); });
  [0x2795].forEach(function(c){ glyph(c, 'plus'); });
  [0x2728,0x2726,0x1F44B].forEach(function(c){ glyph(c, 'sparkle'); });
  glyph(0x2615, 'coffee'); glyph(0x1F381, 'gift'); glyph(0x1F3C6, 'trophy'); glyph(0x1F3E0, 'home'); glyph(0x1F451, 'crown'); glyph(0x1F465, 'users'); glyph(0x1F4A1, 'bulb'); glyph(0x1F4AC, 'chat'); glyph(0x1F4B0, 'money'); glyph(0x1F4BE, 'save'); glyph(0x1F4C1, 'folder'); glyph(0x1F4C4, 'file'); glyph(0x1F4CA, 'chart'); glyph(0x1F4CB, 'clipboard'); glyph(0x1F4CC, 'pin'); glyph(0x1F4E5, 'download'); glyph(0x1F4E6, 'package'); glyph(0x1F4ED, 'inbox'); glyph(0x1F4F8, 'camera'); glyph(0x1F50D, 'search'); glyph(0x1F510, 'lock'); glyph(0x1F517, 'link'); glyph(0x1F525, 'fire'); glyph(0x1F5D1, 'trash'); glyph(0x1F6AA, 'logout'); glyph(0x1F447, 'arrowDown'); glyph(0x1F3AF, 'target'); glyph(0x1F4CD, 'location'); glyph(0x1F4DE, 'phone'); glyph(0x1F4F2, 'mobile'); glyph(0x1F680, 'rocket'); glyph(0x1F916, 'robot'); glyph(0x1F4F7, 'camera'); glyph(0x1F4C5, 'calendar'); glyph(0x1F4E7, 'mail'); glyph(0x1F534, 'status'); glyph(0x1F7E1, 'status'); glyph(0x1F512, 'lock'); glyph(0x26D4, 'stop'); glyph(0x1F464, 'user'); glyph(0x1F4B3, 'card'); glyph(0x1F4F1, 'mobile'); glyph(0x26A1, 'bolt'); glyph(0x1F3EA, 'store'); glyph(0x1F396, 'medal'); glyph(0x1F504, 'refresh'); glyph(0x1F947, 'trophy'); glyph(0x1F948, 'medal'); glyph(0x1F949, 'medal'); glyph(0x1F64F, 'sparkle');

  var EMOJI_TEST = /[\u2600-\u27BF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDEFF]|\uD83E[\uDD00-\uDDFF]/;
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, INPUT: 1, SELECT: 1, OPTION: 1, SVG: 1, PATH: 1 };

  function pickIcon(className, text) {
    var c = String(className || '').toLowerCase();
    var t = String(text || '').toLowerCase();
    if (c.indexOf('whatsapp') > -1 || t.indexOf('whatsapp') > -1) return 'whatsapp';
    if (c.indexOf('home') > -1 || t.indexOf('beranda') > -1) return 'home';
    if (c.indexOf('search') > -1 || t.indexOf('cari') > -1) return 'search';
    if (c.indexOf('shopping') > -1 || c.indexOf('cart') > -1 || t.indexOf('keranjang') > -1) return 'cart';
    if (c.indexOf('user-plus') > -1) return 'userPlus';
    if (c.indexOf('user-check') > -1) return 'userCheck';
    if (c.indexOf('user-clock') > -1) return 'userClock';
    if (c.indexOf('user') > -1 || t.indexOf('akun') > -1) return 'user';
    if (c.indexOf('users') > -1 || t.indexOf('user') > -1) return 'users';
    if (c.indexOf('envelope') > -1 || c.indexOf('mail') > -1 || t.indexOf('email') > -1) return 'mail';
    if (c.indexOf('chart') > -1) return 'chart';
    if (c.indexOf('clock') > -1) return 'clock';
    if (c.indexOf('key') > -1) return 'key';
    if (c.indexOf('paper-plane') > -1 || c.indexOf('send') > -1) return 'send';
    if (c.indexOf('cog') > -1 || c.indexOf('gear') > -1) return 'cog';
    if (c.indexOf('sign-out') > -1) return 'logout';
    if (c.indexOf('bars') > -1) return 'bars';
    if (c.indexOf('spinner') > -1 || c.indexOf('sync') > -1 || c.indexOf('redo') > -1 || c.indexOf('rotate') > -1) return 'refresh';
    if (c.indexOf('plus') > -1 && c.indexOf('calendar') === -1) return 'plus';
    if (c.indexOf('check') > -1) return 'check';
    if (c.indexOf('times') > -1 || c.indexOf('xmark') > -1) return 'x';
    if (c.indexOf('exclamation') > -1 || c.indexOf('triangle') > -1) return 'warning';
    if (c.indexOf('info') > -1) return 'info';
    if (c.indexOf('history') > -1) return 'history';
    if (c.indexOf('list') > -1) return 'list';
    if (c.indexOf('code') > -1) return 'code';
    if (c.indexOf('eye') > -1) return 'eye';
    if (c.indexOf('link') > -1) return 'link';
    if (c.indexOf('save') > -1) return 'save';
    if (c.indexOf('copy') > -1) return 'copy';
    if (c.indexOf('edit') > -1 || c.indexOf('pen') > -1) return 'edit';
    if (c.indexOf('trash') > -1) return 'trash';
    if (c.indexOf('mobile') > -1 || c.indexOf('device') > -1 || c.indexOf('phone') > -1) return 'mobile';
    if (c.indexOf('inbox') > -1) return 'inbox';
    if (c.indexOf('shield') > -1) return 'shield';
    if (c.indexOf('lock') > -1) return 'lock';
    if (c.indexOf('bolt') > -1) return 'bolt';
    if (c.indexOf('rocket') > -1) return 'rocket';
    if (c.indexOf('arrow-right-to-bracket') > -1) return 'arrowLogin';
    if (c.indexOf('arrow-up-right') > -1) return 'arrowUpRight';
    if (c.indexOf('calendar-plus') > -1) return 'calendarPlus';
    if (c.indexOf('calendar-times') > -1 || c.indexOf('calendar-xmark') > -1) return 'calendarX';
    if (c.indexOf('calendar') > -1) return 'calendar';
    if (c.indexOf('stop') > -1) return 'stop';
    if (c.indexOf('tag') > -1) return 'tag';
    return 'sparkle';
  }

  function svgElement(key) {
    var tmp = document.createElement('template');
    tmp.innerHTML = ICONS[key] || ICONS.sparkle;
    return tmp.content.firstElementChild;
  }

  function svgifyIconElement(el) {
    if (!el || el.dataset.liquidSvg === '1') return;
    var icon = svgElement(pickIcon(el.className, el.textContent || ''));
    el.dataset.liquidSvg = '1';
    el.classList.add('liquid-icon-holder');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '';
    el.appendChild(icon);
  }

  function svgifyInlineFontAwesome(root) {
    (root || document).querySelectorAll('i[class*="fa"], span[class*="fa-"]').forEach(svgifyIconElement);
  }

  function prependIcon(el, key) {
    if (!el || el.dataset.liquidAddedIcon === '1' || el.querySelector('svg,.liquid-icon-holder,.liquid-icon-chip,img')) return;
    var icon = svgElement(key || 'sparkle');
    icon.classList.add('liquid-action-icon');
    el.insertBefore(icon, el.firstChild);
    el.dataset.liquidAddedIcon = '1';
  }

  function enhancePlainActions(root) {
    var scope = root || document;
    scope.querySelectorAll('a,button,.nav-item,.mobile-nav-item').forEach(function (el) {
      var text = (el.textContent || '').trim().toLowerCase();
      var href = (el.getAttribute && (el.getAttribute('href') || '')) || '';
      if (text === 'beranda' || href === '/' || href === '/index.html') prependIcon(el, 'home');
      else if (text.indexOf('akun') > -1 || href.indexOf('akun-saya') > -1) prependIcon(el, 'user');
      else if (text.indexOf('cari') > -1) prependIcon(el, 'search');
      else if (text.indexOf('keranjang') > -1) prependIcon(el, 'cart');
      else if (text.indexOf('bayar') > -1 || text.indexOf('checkout') > -1) prependIcon(el, 'cart');
      else if (text.indexOf('simpan') > -1) prependIcon(el, 'save');
      else if (text.indexOf('kirim') > -1) prependIcon(el, 'send');
      else if (text.indexOf('refresh') > -1 || text.indexOf('muat') > -1) prependIcon(el, 'refresh');
    });
  }

  function shouldSkipTextNode(node) {
    var p = node && node.parentNode;
    if (!p || SKIP_TAGS[p.nodeName]) return true;
    if (p.closest && p.closest('script,style,noscript,textarea,input,select,svg,.liquid-icon-chip,.liquid-icon-holder')) return true;
    return false;
  }

  function replaceEmojiTextNode(node) {
    if (!node || node.nodeType !== 3 || shouldSkipTextNode(node)) return;
    var text = node.nodeValue;
    if (!EMOJI_TEST.test(text)) return;
    var frag = document.createDocumentFragment();
    var buf = '';
    var changed = false;
    Array.from(text).forEach(function (ch) {
      if (ch.charCodeAt(0) === 0xFE0F) return;
      var key = GLYPH_ICON_MAP[ch];
      if (!key && EMOJI_TEST.test(ch)) key = 'sparkle';
      if (!key) { buf += ch; return; }
      if (buf) { frag.appendChild(document.createTextNode(buf)); buf = ''; }
      var chip = document.createElement('span');
      chip.className = 'liquid-icon-chip';
      chip.setAttribute('aria-hidden', 'true');
      chip.appendChild(svgElement(key));
      frag.appendChild(chip);
      changed = true;
    });
    if (buf) frag.appendChild(document.createTextNode(buf));
    if (changed && node.parentNode) node.parentNode.replaceChild(frag, node);
  }

  function replaceEmojiInTree(root) {
    var start = root || document.body;
    if (!start) return;
    if (start.nodeType === 3) { replaceEmojiTextNode(start); return; }
    if (start.nodeType !== 1 && start.nodeType !== 9 && start.nodeType !== 11) return;
    if (start.nodeType === 1 && SKIP_TAGS[start.nodeName]) return;
    var walker = document.createTreeWalker(start, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        return shouldSkipTextNode(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(replaceEmojiTextNode);
  }

  function run(root) {
    svgifyInlineFontAwesome(root);
    enhancePlainActions(root);
    replaceEmojiInTree(root || document.body);
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  ready(function () {
    var schedule = window.requestIdleCallback || function (fn) { return setTimeout(fn, 80); };
    var mobilePerf = isMobilePerfMode();
    schedule(function () { run(document); });

    // Di HP, hindari observer terus-menerus karena ini bisa membuat scroll patah-patah.
    // Tetap lakukan beberapa scan ringan untuk konten yang terlambat muncul dari Firebase.
    if (mobilePerf) {
      setTimeout(function () { run(document); }, 1400);
      setTimeout(function () { run(document); }, 3600);
      return;
    }

    var queued = [];
    var pending = false;
    function flush() {
      pending = false;
      var batch = queued.splice(0, 24);
      batch.forEach(function (node) {
        if (!node) return;
        if (node.nodeType === 3) replaceEmojiTextNode(node);
        else if (node.nodeType === 1 || node.nodeType === 11) run(node);
      });
      if (queued.length) requestAnimationFrame(flush);
    }
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes, function (node) { queued.push(node); });
      });
      if (!pending) { pending = true; requestAnimationFrame(flush); }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
})();

/* LiquidGlass Motion Helper - visual only, lightweight and safe */
(function () {
  'use strict';
  function isMobilePerfMode() {
    try {
      return !!(window.matchMedia && (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(pointer: coarse)').matches));
    } catch (e) { return false; }
  }
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }
  ready(function () {
    if (isMobilePerfMode()) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.classList.add('liquid-motion-ready');
    var selector = '.product-card,.collection-card,.saved-item,.method-card,.card,.payment-card,.admin-card,.stat-card,.info-card,.leader-card,.rank-card,.order-card,.product-item,.contact-card,.about-card,.feature-card,.table-wrap,.table-wrapper,.table-container,.table-responsive,.table-scroll,table,.info-row,.product-info-row,.modal-info-row,.pay-row,.cart-item,.item-card,.user-row,.check-row';
    var io = null;
    function mark(el, index) {
      if (!el || el.nodeType !== 1 || el.classList.contains('liquid-observe')) return;
      el.classList.add('liquid-observe');
      el.style.transitionDelay = Math.min((index || 0) * 22, 220) + 'ms';
      if (!io) el.classList.add('liquid-in-view');
      else io.observe(el);
    }
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('liquid-in-view');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.06, rootMargin: '0px 0px -4% 0px' });
    }
    Array.prototype.forEach.call(document.querySelectorAll(selector), mark);
    if ('MutationObserver' in window) {
      var pending = [];
      var ticking = false;
      function flush() {
        ticking = false;
        pending.splice(0, 40).forEach(function (node) {
          if (!node || node.nodeType !== 1) return;
          if (node.matches && node.matches(selector)) mark(node, 1);
          if (node.querySelectorAll) Array.prototype.forEach.call(node.querySelectorAll(selector), mark);
        });
        if (pending.length) requestAnimationFrame(flush);
      }
      var mo = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          Array.prototype.forEach.call(mutation.addedNodes, function (node) { pending.push(node); });
        });
        if (!ticking) { ticking = true; requestAnimationFrame(flush); }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    }
  });
})();
