import { useState, useRef, useEffect } from 'react';

const PROVINCES = [
  'กรุงเทพฯ', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
  'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท',
  'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง',
  'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม',
  'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส',
  'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
  'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา',
  'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์',
  'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
  'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง',
  'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย',
  'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ',
  'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี',
  'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย',
  'หนองบัวลำภู', 'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์',
  'อุทัยธานี', 'อุบลราชธานี',
];

export default function ProvinceInput({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapRef = useRef(null);

  // ซิงค์ value จากข้างนอก
  useEffect(() => { setQuery(value || ''); }, [value]);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query
    ? PROVINCES.filter(p => p.includes(query))
    : PROVINCES;

  const select = (province) => {
    setQuery(province);
    onChange(province);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      setHighlighted(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && filtered[highlighted]) {
      select(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        value={query}
        placeholder={placeholder || 'พิมพ์ชื่อจังหวัด...'}
        onChange={e => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setOpen(true);
          setHighlighted(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        style={{
          width: '100%', padding: '8px 10px',
          borderRadius: 6, border: '1px solid var(--border)',
          fontSize: 13, boxSizing: 'border-box',
          outline: 'none', background: 'var(--bg-base)',
          color: 'var(--text-primary)',
        }}
      />

      {open && filtered.length > 0 && (
        <div style={s.dropdown}>
          {filtered.slice(0, 8).map((p, i) => (
            <div
              key={p}
              style={{
                ...s.item,
                background: i === highlighted
                  ? 'rgba(0,212,255,0.12)'
                  : 'transparent',
                color: i === highlighted
                  ? 'var(--accent)'
                  : 'var(--text-primary)',
              }}
              onMouseDown={() => select(p)}
              onMouseEnter={() => setHighlighted(i)}
            >
              {/* highlight ส่วนที่พิมพ์ */}
              {query ? (
                <>
                  {p.split(query).map((part, idx, arr) => (
                    <span key={idx}>
                      {part}
                      {idx < arr.length - 1 && (
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                          {query}
                        </span>
                      )}
                    </span>
                  ))}
                </>
              ) : p}
            </div>
          ))}
          {filtered.length > 8 && (
            <div style={s.more}>และอีก {filtered.length - 8} จังหวัด...</div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-accent)',
    borderRadius: 'var(--radius-md)',
    zIndex: 100, marginTop: 4,
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
  item: {
    padding: '9px 14px', fontSize: 13,
    cursor: 'pointer', transition: 'background .1s',
  },
  more: {
    padding: '6px 14px', fontSize: 11,
    color: 'var(--text-muted)',
    borderTop: '1px solid var(--border)',
  },
};