import { motion } from "framer-motion";
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback } from "react";
import { Button } from "../ui/button";

const testimonials = [
    {
        quote: "MicroWin changed how I see my days. I used to feel like I did nothing, now I see progress everywhere. It's been a huge help for my motivation.",
        name: "Jessica M.",
        role: "Freelance Designer",
        color: "var(--primary)",
    },
    {
        quote: "As someone who struggles with perfectionism, this app is a godsend. Celebrating the small stuff makes the big goals feel less daunting.",
        name: "David R.",
        role: "Student",
        color: "var(--secondary)",
    },
    {
        quote: "I love the community aspect. It's not competitive, just genuinely supportive. Plus, the badges are super cute.",
        name: "Chen L.",
        role: "Project Manager",
        color: "var(--accent)",
    },
    {
        quote: "This is the first habit app that has actually stuck. The focus on 'wins' instead of 'tasks' is a game-changer for my ADHD brain.",
        name: "Sam B.",
        role: "Developer",
        color: "var(--primary)",
    },
];

const TestimonialCard = ({ quote, name, role, color }: any) => (
    <div className="embla__slide p-4 h-full">
        <div
            className="p-8 rounded-2xl h-full flex flex-col justify-between text-foreground"
            style={{ backgroundColor: color }}
        >
            <p className="text-lg font-medium text-foreground/80 mb-6">"{quote}"</p>
            <div>
                <p className="font-bold text-foreground">{name}</p>
                <p className="text-sm text-foreground/70">{role}</p>
            </div>
        </div>
    </div>
);

export function Testimonials() {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    return (
        <section className="py-24">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold tracking-tight text-center mb-16">Loved by People Building Momentum</h2>
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="embla__container flex">
                        {testimonials.map((testimonial) => (
                            <TestimonialCard key={testimonial.name} {...testimonial} />
                        ))}
                    </div>
                </div>
                <div className="flex justify-center gap-4 mt-8">
                    <Button onClick={scrollPrev} variant="outline" size="icon" className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <Button onClick={scrollNext} variant="outline" size="icon" className="rounded-full">
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </section>
    );
}