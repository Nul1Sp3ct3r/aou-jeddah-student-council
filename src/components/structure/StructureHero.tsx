'use client';

interface Props {
  lang: 'en' | 'ar';
}

export default function StructureHero({ lang }: Props) {
  const t = (en: string, ar: string) => (lang === 'ar' ? ar : en);

  return (
    <section
      className="py-20 text-white text-center"
      style={{ background: 'linear-gradient(135deg, var(--navy-dark), var(--navy-light))' }}
    >
      <div className="max-w-3xl mx-auto px-4">
        <div
          className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-5 tracking-wide uppercase"
          style={{ backgroundColor: 'var(--gold)', color: 'var(--navy)' }}
        >
          {t('Arab Open University – Jeddah Branch', 'الجامعة العربية المفتوحة – فرع جدة')}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
          {t('Organizational Structure', 'الهيكل التنظيمي')}
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed">
          {t(
            'Meet the Student Council leadership and the club teams at Arab Open University – Jeddah Branch.',
            'تعرف على قيادة المجلس الطلابي وفرق الأندية في الجامعة العربية المفتوحة – فرع جدة.',
          )}
        </p>
      </div>
    </section>
  );
}
