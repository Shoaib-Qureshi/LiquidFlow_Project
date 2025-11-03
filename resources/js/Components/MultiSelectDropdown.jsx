import { useState, useRef, useEffect } from 'react';

export default function MultiSelectDropdown({ options = [], selected = [], onChange, placeholder = 'Select...' }) {
      const [open, setOpen] = useState(false);
      const ref = useRef(null);

      useEffect(() => {
            function handleClick(e) {
                  if (ref.current && !ref.current.contains(e.target)) {
                        setOpen(false);
                  }
            }
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
      }, []);

      const toggle = () => setOpen((v) => !v);

      const onToggleOption = (id) => {
            const exists = selected.includes(id);
            let next;
            if (exists) next = selected.filter((s) => s !== id);
            else next = [...selected, id];
            onChange(next);
      };

      const selectedLabels = options.filter((o) => selected.includes(o.id)).map((o) => o.name);

      return (
            <div className="relative" ref={ref}>
                  <button type="button" onClick={toggle} className="w-full text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md p-2 flex items-center justify-between">
                        <div className="truncate text-sm text-gray-700 dark:text-gray-200">{selectedLabels.length ? selectedLabels.join(', ') : placeholder}</div>
                        <svg className={`w-4 h-4 ml-2 text-gray-500 transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.085l3.71-3.854a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                  </button>

                  {open && (
                        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-56 overflow-auto">
                              <ul className="p-2">
                                    {options.map((o) => (
                                          <li key={o.id} className="flex items-center px-2 py-1 hover:bg-gray-50 dark:hover:bg-slate-700 rounded">
                                                <label className="flex items-center w-full cursor-pointer">
                                                      <input type="checkbox" checked={selected.includes(o.id)} onChange={() => onToggleOption(o.id)} className="mr-2" />
                                                      <span className="text-sm text-gray-700 dark:text-gray-200">{o.name}</span>
                                                </label>
                                          </li>
                                    ))}
                              </ul>
                        </div>
                  )}
            </div>
      );
}
