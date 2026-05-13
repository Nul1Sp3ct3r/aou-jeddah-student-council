'use client';

import type { OrganizationalMember } from '../../types';
import { CLUBS } from '../../types';

interface Props {
  members: OrganizationalMember[];
  lang: 'en' | 'ar';
}

function ChartNode({
  label,
  sublabel,
  gold,
  color,
  children,
}: {
  label: string;
  sublabel?: string;
  gold?: boolean;
  color?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative px-4 py-2.5 rounded-xl text-center shadow-sm border min-w-[140px] max-w-[180px]"
        style={
          gold
            ? { backgroundColor: 'var(--gold)', borderColor: 'var(--gold)', color: 'var(--navy)' }
            : color
            ? { backgroundColor: color + '15', borderColor: color + '40', color: color }
            : { backgroundColor: 'var(--navy)', borderColor: 'var(--navy)', color: 'white' }
        }
      >
        <p className="text-xs font-bold leading-tight">{label}</p>
        {sublabel && <p className="text-xs opacity-70 mt-0.5 leading-tight">{sublabel}</p>}
      </div>
      {children && (
        <div className="flex flex-col items-center">
          <div className="w-px h-5 bg-gray-300" />
          {children}
        </div>
      )}
    </div>
  );
}

function ChartRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-px h-5 bg-gray-300" />
      <div className="relative flex gap-4 items-start">
        {/* horizontal connector line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-gray-300"
          style={{ width: 'calc(100% - 80px)' }}
        />
        {children}
      </div>
    </div>
  );
}

export default function OrganizationChart({ members, lang }: Props) {
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  const president = members.find((m) => m.roleCategory === 'council_president');
  const vp = members.find((m) => m.roleCategory === 'council_vice_president');
  const secretary = members.find((m) => m.roleCategory === 'council_secretary');
  const supervisor = members.find((m) => m.roleCategory === 'clubs_supervisor');
  const officers = members.filter((m) => m.roleCategory === 'council_officer');
  const clubPresidents = members.filter((m) => m.roleCategory === 'club_president');
  const clubVPs = members.filter((m) => m.roleCategory === 'club_vice_president');

  const presidentLabel = president
    ? t(president.fullNameEn, president.fullNameAr)
    : t('Council President', 'رئيس المجلس');

  const vpLabel = vp
    ? t(vp.fullNameEn, vp.fullNameAr)
    : t('Vice President', 'نائب الرئيس');

  return (
    <>
      {/* Desktop chart */}
      <div className="hidden md:flex flex-col items-center py-8 overflow-x-auto">
        <ChartNode label={presidentLabel} sublabel={t('Student Council President', 'رئيس المجلس الطلابي')} gold>
          <div className="flex flex-col items-center">
            <div className="w-px h-5 bg-gray-300" />
            {/* Second row: VP, Secretary, Officers, Supervisor */}
            <div className="relative flex gap-4 items-start">
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-gray-300"
                style={{ width: 'calc(100% - 40px)', minWidth: '300px' }}
              />
              {/* VP */}
              <ChartNode label={vpLabel} sublabel={t('Vice President', 'نائب الرئيس')} />
              {/* Secretary */}
              {secretary && (
                <ChartNode
                  label={t(secretary.fullNameEn, secretary.fullNameAr)}
                  sublabel={t('Secretary', 'أمين المجلس')}
                />
              )}
              {/* Officers */}
              {officers.map((o) => (
                <ChartNode
                  key={o.id}
                  label={t(o.fullNameEn, o.fullNameAr)}
                  sublabel={t(o.positionEn, o.positionAr)}
                />
              ))}
              {/* Supervisor branch */}
              {supervisor && (
                <ChartNode
                  label={t(supervisor.fullNameEn, supervisor.fullNameAr)}
                  sublabel={t('Clubs Supervisor', 'مشرف الأندية')}
                >
                  {/* Club Presidents row */}
                  <div className="flex flex-col items-center">
                    <div className="w-px h-5 bg-gray-300" />
                    <div className="relative flex gap-3 items-start">
                      <div
                        className="absolute top-0 left-1/2 -translate-x-1/2 h-px bg-gray-300"
                        style={{ width: 'calc(100% - 20px)', minWidth: '200px' }}
                      />
                      {CLUBS.map((club) => {
                        const cp = clubPresidents.find((m) => m.clubId === club.id);
                        const cvp = clubVPs.find((m) => m.clubId === club.id);
                        return (
                          <ChartNode
                            key={club.id}
                            label={cp ? t(cp.fullNameEn, cp.fullNameAr) : t(club.name, club.nameAr)}
                            sublabel={t(club.name, club.nameAr)}
                            color={club.color}
                          >
                            {cvp && (
                              <ChartNode
                                label={t(cvp.fullNameEn, cvp.fullNameAr)}
                                sublabel={t('Vice President', 'نائب الرئيس')}
                                color={club.color}
                              />
                            )}
                          </ChartNode>
                        );
                      })}
                    </div>
                  </div>
                </ChartNode>
              )}
            </div>
          </div>
        </ChartNode>
      </div>

      {/* Mobile — stacked cards */}
      <div className="md:hidden space-y-3 py-4">
        {/* Council level */}
        <div
          className="rounded-xl p-4 border"
          style={{ backgroundColor: 'var(--gold)', borderColor: 'var(--gold)' }}
        >
          <p className="text-xs font-bold" style={{ color: 'var(--navy)' }}>
            {t('Student Council President', 'رئيس المجلس الطلابي')}
          </p>
          <p className="text-sm font-semibold" style={{ color: 'var(--navy)' }}>{presidentLabel}</p>
        </div>
        <div className="flex gap-2">
          <div className="w-6 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            {vp && (
              <div className="rounded-xl p-3 border" style={{ backgroundColor: 'var(--navy)', borderColor: 'var(--navy)' }}>
                <p className="text-xs text-gray-300">{t('Vice President', 'نائب الرئيس')}</p>
                <p className="text-sm font-semibold text-white">{t(vp.fullNameEn, vp.fullNameAr)}</p>
              </div>
            )}
            {secretary && (
              <div className="rounded-xl p-3 border border-gray-200 bg-white">
                <p className="text-xs text-gray-400">{t('Secretary', 'أمين المجلس')}</p>
                <p className="text-sm font-semibold text-gray-800">{t(secretary.fullNameEn, secretary.fullNameAr)}</p>
              </div>
            )}
            {officers.map((o) => (
              <div key={o.id} className="rounded-xl p-3 border border-gray-200 bg-white">
                <p className="text-xs text-gray-400">{t(o.positionEn, o.positionAr)}</p>
                <p className="text-sm font-semibold text-gray-800">{t(o.fullNameEn, o.fullNameAr)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Clubs level */}
        {supervisor && (
          <>
            <div className="rounded-xl p-3 border border-teal-200 bg-teal-50">
              <p className="text-xs text-teal-600">{t('Clubs Supervisor', 'مشرف الأندية')}</p>
              <p className="text-sm font-semibold text-teal-900">{t(supervisor.fullNameEn, supervisor.fullNameAr)}</p>
            </div>
            <div className="space-y-2">
              {CLUBS.map((club) => {
                const cp = clubPresidents.find((m) => m.clubId === club.id);
                const cvp = clubVPs.find((m) => m.clubId === club.id);
                return (
                  <div
                    key={club.id}
                    className="rounded-xl p-3 border"
                    style={{ borderColor: club.color + '40', backgroundColor: club.color + '08' }}
                  >
                    <p className="text-xs font-semibold mb-1" style={{ color: club.color }}>
                      {t(club.name, club.nameAr)}
                    </p>
                    {cp && (
                      <p className="text-sm font-medium text-gray-800">
                        {t('President', 'الرئيس')}: {t(cp.fullNameEn, cp.fullNameAr)}
                      </p>
                    )}
                    {cvp && (
                      <p className="text-sm text-gray-600">
                        {t('VP', 'نائب')}: {t(cvp.fullNameEn, cvp.fullNameAr)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
