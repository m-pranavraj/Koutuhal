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
    <Accordion type="single" collapsible className="w-full space-y-2">
      {weeks.map((week, index) => (
        <AccordionItem
          key={week.week}
          value={`week-${index}`}
          className="overflow-hidden rounded-lg border bg-card px-4"
        >
          <AccordionTrigger className="py-4 hover:no-underline">
            <div className="flex items-center gap-4 text-left">
              <span className="flex h-8 w-16 items-center justify-center rounded bg-primary/10 text-xs font-semibold text-primary">
                {week.week}
              </span>
              <span className="font-medium">{week.title}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <ul className="ml-20 space-y-2">
              {week.topics.map((topic, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {topic}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
