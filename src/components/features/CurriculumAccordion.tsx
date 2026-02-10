import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface WeekContent {
  week: string;
  title: string;
  topics: string[];
}

interface CurriculumAccordionProps {
  weeks: WeekContent[];
}

export const CurriculumAccordion = ({ weeks }: CurriculumAccordionProps) => {
  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {weeks.map((week, index) => (
        <AccordionItem
          key={week.week}
          value={`week-${index}`}
          className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-sm transition-all data-[state=open]:shadow-md data-[state=open]:border-[#ADFF44]/30"
        >
          <AccordionTrigger className="px-6 py-5 hover:no-underline group">
            <div className="flex items-center gap-6 text-left w-full">
              <span className="flex h-10 w-24 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold uppercase tracking-wider text-neutral-400 group-hover:bg-[#ADFF44]/10 group-hover:text-[#ADFF44] transition-colors">
                {week.week}
              </span>
              <span className="font-bold text-lg text-white group-data-[state=open]:text-[#ADFF44] transition-colors">{week.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-2 px-6">
            <div className="ml-[6.5rem] pl-6 border-l-2 border-neutral-800 space-y-3">
              {week.topics.map((topic, i) => (
                <div key={i} className="flex items-start gap-3 text-neutral-400">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ADFF44] shrink-0" />
                  <span className="leading-relaxed">{topic}</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
