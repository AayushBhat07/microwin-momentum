import { motion } from "framer-motion";

const testimonials = [
    {
        quote: "MicroWin changed how I see my days. I used to feel like I did nothing, now I see progress everywhere. It's been a huge help for my motivation.",
        name: "Jessica M.",
        role: "Freelance Designer",
        color: "var(--color-teal)",
    },
    {
        quote: "As someone who struggles with perfectionism, this app is a godsend. Celebrating the small stuff makes the big goals feel less daunting.",
        name: "David R.",
        role: "Student",
        color: "var(--color-magenta)",
    },
    {
        quote: "I love the community aspect. It's not competitive, just genuinely supportive. Plus, the badges are super cute.",
        name: "Chen L.",
        role: "Project Manager",
        color: "var(--color-gold)",
    },
];

const TestimonialCard = ({ quote, name, role, color, index }: any) => (
    <motion.div
        className="p-8 rounded-2xl h-full flex flex-col justify-between text-ink"
        style={{ backgroundColor: color }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
    >
        <p className="text-lg font-medium text-ink/80 mb-6">"{quote}"</p>
        <div>
            <p className="font-bold text-ink">{name}</p>
            <p className="text-sm text-ink/70">{role}</p>
        </div>
    </motion.div>
);

export function Testimonials() {
    return (
        <section className="py-24">
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-bold tracking-tight text-center mb-16">Loved by People Building Momentum</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, i) => (
                        <TestimonialCard key={testimonial.name} {...testimonial} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
