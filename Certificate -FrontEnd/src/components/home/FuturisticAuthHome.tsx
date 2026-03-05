import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FileText, Upload, Download, Sparkles } from "lucide-react";

export default function CertificateHome() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative py-32 px-6 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] overflow-hidden">
        {/* Gradient glow background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl dark:from-blue-600/20 dark:to-purple-600/20" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight mb-8"
          >
            Generate Certificates
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {" "}Instantly
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Upload participant data, generate professional certificates in seconds,
            and download them instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Button size="lg" className="rounded-xl px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow">
              Get Started Free
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-xl px-8 py-6 text-base font-semibold border-2 hover:bg-background/5 transition-all"
            >
              View Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-background/50 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Everything you need to generate professional certificates at scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Upload CSV Data",
              desc: "Easily upload participant data using a CSV file and generate certificates in bulk.",
              icon: <Upload className="w-10 h-10" />,
            },
            {
              title: "Custom Certificate Templates",
              desc: "Design and upload your own certificate templates to match your brand.",
              icon: <FileText className="w-10 h-10" />,
            },
            {
              title: "Instant Certificate Download",
              desc: "Generate and download certificates instantly as high-quality PDFs.",
              icon: <Download className="w-10 h-10" />,
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="border border-border bg-background/80 backdrop-blur-sm hover:bg-background/90 hover:border-border hover:shadow-md dark:hover:shadow-lg transition-all rounded-xl overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6 text-primary">
                    {f.icon}
                  </div>

                  <h3 className="text-2xl font-semibold mb-3 text-foreground">{f.title}</h3>

                  <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple 3-step process to generate your certificates
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-semibold mb-3">Upload CSV</h3>
              <p className="text-muted-foreground">Add participant details like name and email using a CSV file.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-semibold mb-3">Select Template</h3>
              <p className="text-muted-foreground">Upload or choose a certificate template.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white rounded-full flex items-center justify-center text-3xl font-bold mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-semibold mb-3">Generate</h3>
              <p className="text-muted-foreground">Generate and download certificates instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-background/50 border-y border-border">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Start Generating Certificates Today</h2>

          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Create beautiful certificates for events, workshops, and courses instantly.
          </p>

          <Button size="lg" className="rounded-xl px-10 py-7 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow">
            Generate Now
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for teams and creators who demand the best
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <Sparkles className="w-8 h-8 text-primary mt-1" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Bulk Certificate Generation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Generate hundreds or thousands of certificates at once without
                  manual work.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <Sparkles className="w-8 h-8 text-primary mt-1" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Easy Template Customization</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload beautiful templates and customize them easily to match your
                  brand.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <Sparkles className="w-8 h-8 text-primary mt-1" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Fast Processing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our system generates certificates instantly without delays.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <Sparkles className="w-8 h-8 text-primary mt-1" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-3">Developer Friendly API</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Simple API and easy integration for developers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-6 bg-background/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Certificate Generator</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate professional certificates instantly with our powerful platform.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition">Templates</a></li>
                <li><a href="#" className="hover:text-foreground transition">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">About</a></li>
                <li><a href="#" className="hover:text-foreground transition">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Certificate Generator. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}