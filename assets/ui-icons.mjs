import {brandIcon} from './brand-icons.mjs';
export const uiIcon=(name='arrow')=>brandIcon(name)||`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${{
 check:'<path d="m5 12 4 4L19 6"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',spark:'<path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2Z"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',minus:'<path d="M5 12h14"/>',back:'<path d="M19 12H5m6-6-6 6 6 6"/>',menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',plus:'<path d="M12 5v14M5 12h14"/>',home:'<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>',
 services:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 quote:'<path d="M21 11a8 8 0 0 1-8 8H8l-5 3V5a2 2 0 0 1 2-2h8a8 8 0 0 1 8 8Z"/><path d="M7 8h9M7 12h6"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18m-13 5 3 3 5-5"/>',
 people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m3 10v-3a6 6 0 0 0-2-4"/>',
 shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
 leaf:'<path d="M20 3c0 10-2 16-10 16a7 7 0 0 1-7-7C3 4 12 6 20 3Z"/><path d="M3 21 15 9"/>',
 redo:'<path d="M3 10a9 9 0 1 1 0 6M3 3v7h7"/><path d="m9 13 2 2 5-5"/>',
 price:'<path d="M6 3h12M6 8h12M8 3c7 0 7 9 0 9H6l10 9"/>',
 external:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>',
 star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
 pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
 work:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m3 16 5-5 4 4 4-7 5 6"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
 phone:'<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7l.4 2.7a2 2 0 0 1-.6 1.7L8.6 10.4a16 16 0 0 0 5 5l1.3-1.3a2 2 0 0 1 1.7-.6l2.7.4a2 2 0 0 1 1.7 2Z"/>',
 chevron:'<path d="m7 10 5 5 5-5"/>',
 help:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H8l-5 2V11.5a8.5 8.5 0 1 1 18 0Z"/><path d="M9.5 8.5a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 3.5m0 3h.01"/>'
}[name]||''}</svg>`;
