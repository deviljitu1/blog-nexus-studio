import { Users, Target, Award, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  const team = [
    {
      name: "Sarah Johnson",
      role: "Editor-in-Chief",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      bio: "10+ years in tech journalism, passionate about emerging technologies."
    },
    {
      name: "Michael Chen",
      role: "Senior Developer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      bio: "Full-stack developer and technical writer specializing in modern web technologies."
    },
    {
      name: "Emily Rodriguez",
      role: "Content Creator",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      bio: "Creative writer focused on design trends and user experience."
    }
  ];

  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To democratize knowledge and make complex technical concepts accessible to everyone through clear, engaging content."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We maintain the highest standards in content quality, ensuring every article provides real value to our readers."
    },
    {
      icon: Heart,
      title: "Community",
      description: "Building a vibrant community of learners, creators, and innovators who share knowledge and grow together."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 hero-gradient text-white">
        <div className="container text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            About ModernBlog
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-white/90">
            We're passionate storytellers and technologists dedicated to sharing 
            knowledge that inspires, educates, and empowers the next generation of creators.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center">
              Our Story
            </h2>
            <div className="prose-blog text-center">
              <p className="text-lg leading-relaxed mb-6">
                ModernBlog started as a simple idea: to bridge the gap between complex 
                technical concepts and practical, actionable knowledge. Founded in 2020 
                by a group of passionate developers and writers, we've grown into a 
                trusted resource for thousands of readers worldwide.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Our journey began when we noticed a lack of high-quality, accessible 
                content that could help both beginners and experienced professionals 
                navigate the rapidly evolving world of technology and design.
              </p>
              <p className="text-lg leading-relaxed">
                Today, we continue to pursue our mission of making learning engaging, 
                accessible, and practical for everyone, regardless of their background 
                or experience level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center shadow-card hover:shadow-elegant transition-all duration-300">
                <CardContent className="pt-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif font-semibold text-xl mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center shadow-card hover:shadow-elegant transition-all duration-300">
                <CardContent className="pt-8">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="font-serif font-semibold text-xl mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-4">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 hero-gradient text-white">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">
            Our Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">150+</div>
              <div className="text-white/80">Articles Published</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-white/80">Monthly Readers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">25+</div>
              <div className="text-white/80">Countries Reached</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-white/80">Reader Satisfaction</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;