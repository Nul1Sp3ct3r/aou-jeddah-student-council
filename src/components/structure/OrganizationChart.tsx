'use client';

import type { OrganizationalMember } from '../../types';
import { CLUBS } from '../../types';

interface Props {
  members: OrganizationalMember[];
  lang: 'en' | 'ar';
}

// ─── Design tokens ────────────────────────────────────────────────────────────

const LINE = 'rgba(15, 42, 74, 0.15)';
const GOLD = 'var(--gold)';
const NAVY = 'var(--navy)';

// ─── Sub-components ───────────────────────────────────────────────────────────

function VStem({ h = 32 }: { h?: number }) {
  return (
    <div
      className="w-px mx-auto flex-shrink-0"
      style={{ height: h, backgroundColor: LINE }}
    />
  );
}

/** Single org-chart card with circular avatar, role, and name. */
function OrgCard({
  name,
  role,
  accent,
  size = 'md',
}: {
  name: string;
  role: string;
  /** Top-border / avatar accent color. Defaults to gold. */
  accent?: string;
  size?: 'lg' | 'md' | 'sm';
}) {
  const initial = (name.trim()[0] ?? '?').toUpperCase();

  const avatarCls =
    size === 'lg'
      ? 'w-16 h-16 text-xl -mt-8 mb-3'
      : size === 'sm'
      ? 'w-10 h-10 text-sm -mt-5 mb-2'
      : 'w-12 h-12 text-base -mt-6 mb-2';

  const nameCls =
    size === 'lg' ? 'text-sm font-extrabold' : size === 'sm' ? 'text-xs font-semibold' : 'text-xs font-bold';

  const roleCls = size === 'sm' ? 'text-[9px]' : 'text-[10px]';

  const padCls = size === 'lg' ? 'pt-10 pb-5 px-4' : size === 'sm' ? 'pt-6 pb-3 px-2' : 'pt-8 pb-4 px-3';

  const isColored = !!accent && accent !== GOLD;
  const avatarBg = isColored ? accent + '22' : NAVY;
  const avatarColor = isColored ? accent : GOLD;
  const avatarBorder = `2px solid ${accent ?? GOLD}`;

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-md w-full text-center hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col items-center ${padCls}`}
      style={{ borderTop: `4px solid ${accent ?? GOLD}` }}
    >
      {/* Avatar — overlaps the top border */}
      <div
        className={`${avatarCls} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
        style={{ backgroundColor: avatarBg, color: avatarColor, border: avatarBorder }}
      >
        {initial}
      </div>

      {/* Role label */}
      <p
        className={`${roleCls} uppercase tracking-wider font-semibold mb-0.5 leading-snug`}
        style={{ color: accent ?? GOLD }}
      >
        {role}
      </p>

      {/* Name */}
      <p className={`${nameCls} leading-snug`} style={{ color: NAVY }}>
        {name}
      </p>
    </div>
  );
}

/**
 * A horizontal row of cards with a connecting spine at the top.
 * Uses CSS grid with equal columns so the %-based bar math is exact.
 */
function CardRow({
  items,
  minCardWidth = 130,
  maxCardWidth = 180,
}: {
  items: {
    id: string;
    name: string;
    role: string;
    accent?: string;
    size?: 'lg' | 'md' | 'sm';
    /** Optional sub-row rendered below this card */
    below?: React.ReactNode;
  }[];
  minCardWidth?: number;
  maxCardWidth?: number;
}) {
  if (items.length === 0) return null;
  const n = items.length;

  return (
    <div className="relative w-full">
      {/* Horizontal spine — spans from center of first col to center of last col */}
      {n > 1 && (
        <div
          className="absolute top-0 h-px pointer-events-none"
          style={{
            backgroundColor: LINE,
            left: `${50 / n}%`,
            right: `${50 / n}%`,
          }}
        />
      )}

      {/* Equal-width columns via grid */}
      <div
        className="grid"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(${minCardWidth}px, ${maxCardWidth}px))`, justifyContent: 'center', gap: '12px' }}
      >
        {items.map((item) => (
          <div key={item.id} className="flex flex-col items-center">
            {/* Vertical drop from spine to card */}
            <VStem h={28} />
            <OrgCard
              name={item.name}
              role={item.role}
              accent={item.accent}
              size={item.size}
            />
            {item.below && (
              <>
                <VStem h={20} />
                {item.below}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Section heading with a gold underline — separates hierarchy levels. */
function LevelLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-2 w-full max-w-3xl mx-auto">
      <div className="flex-1 h-px" style={{ backgroundColor: LINE }} />
      <span
        className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: GOLD + '20', color: NAVY }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: LINE }} />
    </div>
  );
}

// ─── Mobile chart ─────────────────────────────────────────────────────────────

function MobileOrgChart({
  members,
  t,
}: {
  members: OrganizationalMember[];
  t: (en: string, ar: string) => string;
}) {
  const president = members.find((m) => m.roleCategory === 'council_president');
  const vp = members.find((m) => m.roleCategory === 'council_vice_president');
  const secretary = members.find((m) => m.roleCategory === 'council_secretary');
  const supervisor = members.find((m) => m.roleCategory === 'clubs_supervisor');
  const officers = members.filter((m) => m.roleCategory === 'council_officer');
  const clubPresidents = members.filter((m) => m.roleCategory === 'club_president');
  const clubVPs = members.filter((m) => m.roleCategory === 'club_vice_president');

  function MobileCard({
    name,
    role,
    accent,
    indent = 0,
  }: {
    name: string;
    role: string;
    accent?: string;
    indent?: number;
  }) {
    return (
      <div style={{ paddingLeft: indent * 16 }} className="mb-2">
        <div
          className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center gap-3"
          style={{ borderLeft: `4px solid ${accent ?? GOLD}` }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              backgroundColor: accent ? accent + '20' : NAVY,
              color: accent ?? GOLD,
              border: `2px solid ${accent ?? GOLD}`,
            }}
          >
            {(name.trim()[0] ?? '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: accent ?? GOLD }}>
              {role}
            </p>
            <p className="text-xs font-bold truncate" style={{ color: NAVY }}>
              {name}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 py-4">
      {/* L1 */}
      {president && (
        <MobileCard
          name={t(president.fullNameEn, president.fullNameAr)}
          role={t('Student Council President', 'رئيس المجلس الطلابي')}
        />
      )}
      {/* L2 */}
      {vp && (
        <MobileCard
          name={t(vp.fullNameEn, vp.fullNameAr)}
          role={t('Vice President', 'نائب رئيس المجلس')}
          indent={1}
        />
      )}
      {secretary && (
        <MobileCard
          name={t(secretary.fullNameEn, secretary.fullNameAr)}
          role={t('Secretary', 'أمين المجلس')}
          indent={1}
        />
      )}
      {officers.map((o) => (
        <MobileCard
          key={o.id}
          name={t(o.fullNameEn, o.fullNameAr)}
          role={t(o.positionEn, o.positionAr)}
          indent={1}
        />
      ))}
      {supervisor && (
        <MobileCard
          name={t(supervisor.fullNameEn, supervisor.fullNameAr)}
          role={t('Clubs Supervisor', 'مشرف الأندية')}
          indent={1}
        />
      )}
      {/* L3 + L4 */}
      {CLUBS.map((club) => {
        const cp = clubPresidents.find((m) => m.clubId === club.id);
        const cvp = clubVPs.find((m) => m.clubId === club.id);
        return (
          <div key={club.id}>
            {cp && (
              <MobileCard
                name={t(cp.fullNameEn, cp.fullNameAr)}
                role={t(club.name, club.nameAr)}
                accent={club.color}
                indent={2}
              />
            )}
            {cvp && (
              <MobileCard
                name={t(cvp.fullNameEn, cvp.fullNameAr)}
                role={t('Vice President', 'نائب الرئيس')}
                accent={club.color}
                indent={3}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrganizationChart({ members, lang }: Props) {
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const president = members.find((m) => m.roleCategory === 'council_president');
  const vp = members.find((m) => m.roleCategory === 'council_vice_president');
  const secretary = members.find((m) => m.roleCategory === 'council_secretary');
  const supervisor = members.find((m) => m.roleCategory === 'clubs_supervisor');
  const officers = members.filter((m) => m.roleCategory === 'council_officer');
  const clubPresidents = members.filter((m) => m.roleCategory === 'club_president');
  const clubVPs = members.filter((m) => m.roleCategory === 'club_vice_president');

  const presidentName = president
    ? t(president.fullNameEn, president.fullNameAr)
    : t('Council President', 'رئيس المجلس');

  // Level 2 items
  const level2: Parameters<typeof CardRow>[0]['items'] = [
    ...(vp
      ? [{ id: vp.id, name: t(vp.fullNameEn, vp.fullNameAr), role: t('Vice President', 'نائب رئيس المجلس') }]
      : []),
    ...(secretary
      ? [{ id: secretary.id, name: t(secretary.fullNameEn, secretary.fullNameAr), role: t('Secretary', 'أمين المجلس') }]
      : []),
    ...officers.map((o) => ({
      id: o.id,
      name: t(o.fullNameEn, o.fullNameAr),
      role: t(o.positionEn, o.positionAr),
    })),
    ...(supervisor
      ? [{ id: supervisor.id, name: t(supervisor.fullNameEn, supervisor.fullNameAr), role: t('Clubs Supervisor', 'مشرف الأندية') }]
      : []),
  ];

  // Level 3: one item per club, with the VP nested below as `below`
  const level3 = CLUBS.map((club) => {
    const cp = clubPresidents.find((m) => m.clubId === club.id);
    const cvp = clubVPs.find((m) => m.clubId === club.id);

    const vpBelow = cvp ? (
      <OrgCard
        name={t(cvp.fullNameEn, cvp.fullNameAr)}
        role={t('Vice President', 'نائب الرئيس')}
        accent={club.color}
        size="sm"
      />
    ) : undefined;

    return {
      id: club.id,
      name: cp ? t(cp.fullNameEn, cp.fullNameAr) : t(club.name, club.nameAr),
      role: t(club.name, club.nameAr),
      accent: club.color,
      size: 'md' as const,
      below: vpBelow,
    };
  });

  return (
    <>
      {/* ── Desktop ──────────────────────────────────────────────────────────── */}
      <div className="hidden md:block py-6 overflow-x-auto">
        <div
          className="flex flex-col items-center mx-auto"
          style={{ minWidth: 700, maxWidth: 1200 }}
        >
          {/* Level 1 — President */}
          <LevelLabel label={t('Student Council', 'المجلس الطلابي')} />
          <div style={{ width: 220 }}>
            <OrgCard name={presidentName} role={t('Student Council President', 'رئيس المجلس الطلابي')} size="lg" />
          </div>

          {/* Stem down */}
          <VStem h={28} />

          {/* Level 2 — Council members */}
          {level2.length > 0 && (
            <>
              <LevelLabel label={t('Council Officers', 'أعضاء المجلس')} />
              <div className="w-full">
                <CardRow items={level2} minCardWidth={140} maxCardWidth={190} />
              </div>
              <VStem h={36} />
            </>
          )}

          {/* Level 3+4 — Clubs */}
          <LevelLabel label={t('Club Leadership', 'قيادة الأندية')} />
          <div className="w-full">
            <CardRow items={level3} minCardWidth={130} maxCardWidth={175} />
          </div>
        </div>
      </div>

      {/* ── Mobile ───────────────────────────────────────────────────────────── */}
      <div className="md:hidden">
        <MobileOrgChart members={members} t={t} />
      </div>
    </>
  );
}
