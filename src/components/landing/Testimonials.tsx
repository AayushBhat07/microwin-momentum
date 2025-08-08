import { Case } from "@/components/ui/cases-with-infinite-scroll";
import "@/components/ui/cases-with-infinite-scroll.css";

const testimonials = [
    {
        quote: "MicroWin changed how I see my days. I used to feel like I did nothing, now I see progress everywhere. It's been a huge help for my motivation.",
        name: "Jessica M.",
        role: "Freelance Designer",
    },
    {
        quote: "As someone who struggles with perfectionism, this app is a godsend. Celebrating the small stuff makes the big goals feel less daunting.",
        name: "David R.",
        role: "Student",
    },
    {
        quote: "I love the community aspect. It's not competitive, just genuinely supportive. Plus, the badges are super cute.",
        name: "Chen L.",
        role: "Project Manager",
    },
    {
        quote: "This is the first habit app that has actually stuck. The focus on 'wins' instead of 'tasks' is a game-changer for my ADHD brain.",
        name: "Sam B.",
        role: "Developer",
    },
    {
        quote: "I was skeptical, but the positive reinforcement loop is real. I'm more productive and less stressed. Highly recommend.",
        name: "Maria G.",
        role: "Entrepreneur"
    }
];

export function Testimonials() {
    return (
        <section id="testimonials" className="py-24 testimonials-section">
            <div className="container mx-auto px-6">
                <div className="max-w-2xl mx-auto text-center mb-12">
                    <h2 className="text-4xl font-bold tracking-tight">What people are saying</h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Real stories from small wins turning into big momentum.
                    </p>
                </div>
                <div className="relative flex flex-col items-center justify-center">
                    <Case items={testimonials} speed="normal" />
                </div>
            </div>
        </section>
    );
}