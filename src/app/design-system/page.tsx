'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-serif text-5xl font-bold text-neutral-900">Design System</h1>
          <p className="mt-2 text-lg text-neutral-600">Lyra Fashion - Organic Modern Aesthetic</p>
        </div>

        {/* Color Palette Section */}
        <section className="mb-16">
          <h2 className="mb-6 font-serif text-3xl font-semibold text-neutral-900">Color Palette</h2>

          {/* Primary Colors */}
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-medium text-neutral-800">Primary - Earthy Green</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 md:grid-cols-10">
              {[
                { shade: '50', hex: '#f3f6f4' },
                { shade: '100', hex: '#e1e9e3' },
                { shade: '200', hex: '#c4d5c8' },
                { shade: '300', hex: '#9db8a4' },
                { shade: '400', hex: '#7a9b7c' },
                { shade: '500', hex: '#5f8161' },
                { shade: '600', hex: '#4a5f4b' },
                { shade: '700', hex: '#3c4d3d' },
                { shade: '800', hex: '#323f33' },
                { shade: '900', hex: '#2b362c' },
              ].map((color) => (
                <div key={color.shade} className="text-center">
                  <div
                    className="mb-2 h-16 rounded-lg border border-neutral-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-xs font-medium text-neutral-700">{color.shade}</div>
                  <div className="text-xs text-neutral-500">{color.hex}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Colors */}
          <div className="mb-8">
            <h3 className="mb-4 text-xl font-medium text-neutral-800">
              Secondary - Warm Terracotta
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 md:grid-cols-10">
              {[
                { shade: '50', hex: '#fcf4f2' },
                { shade: '100', hex: '#f9e7e3' },
                { shade: '200', hex: '#f3cfc7' },
                { shade: '300', hex: '#e8a896' },
                { shade: '400', hex: '#dc8c73' },
                { shade: '500', hex: '#c87e6c' },
                { shade: '600', hex: '#b36854' },
                { shade: '700', hex: '#8e5243' },
                { shade: '800', hex: '#754439' },
                { shade: '900', hex: '#442f27' },
              ].map((color) => (
                <div key={color.shade} className="text-center">
                  <div
                    className="mb-2 h-16 rounded-lg border border-neutral-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-xs font-medium text-neutral-700">{color.shade}</div>
                  <div className="text-xs text-neutral-500">{color.hex}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Neutral Colors */}
          <div>
            <h3 className="mb-4 text-xl font-medium text-neutral-800">Neutral - Warm Grays</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 md:grid-cols-10">
              {[
                { shade: '50', hex: '#f5f3f0' },
                { shade: '100', hex: '#ebe8e3' },
                { shade: '200', hex: '#ddd8d1' },
                { shade: '300', hex: '#c5beb5' },
                { shade: '400', hex: '#a8a097' },
                { shade: '500', hex: '#8b8279' },
                { shade: '600', hex: '#6e665e' },
                { shade: '700', hex: '#564f48' },
                { shade: '800', hex: '#44403a' },
                { shade: '900', hex: '#3a3531' },
              ].map((color) => (
                <div key={color.shade} className="text-center">
                  <div
                    className="mb-2 h-16 rounded-lg border border-neutral-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-xs font-medium text-neutral-700">{color.shade}</div>
                  <div className="text-xs text-neutral-500">{color.hex}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="mb-6 font-serif text-3xl font-semibold text-neutral-900">Typography</h2>

          <div className="space-y-6 rounded-xl bg-white p-8 shadow">
            <div>
              <p className="mb-2 text-sm text-neutral-500">Heading 1 - Playfair Display 700</p>
              <h1 className="font-serif text-5xl font-bold text-neutral-900">
                Handcrafted Fashion
              </h1>
            </div>
            <div>
              <p className="mb-2 text-sm text-neutral-500">Heading 2 - Playfair Display 600</p>
              <h2 className="font-serif text-4xl font-semibold text-neutral-900">
                Artisan Quality
              </h2>
            </div>
            <div>
              <p className="mb-2 text-sm text-neutral-500">Heading 3 - Playfair Display 600</p>
              <h3 className="font-serif text-3xl font-semibold text-neutral-900">
                Sustainable Design
              </h3>
            </div>
            <div>
              <p className="mb-2 text-sm text-neutral-500">Heading 4 - Playfair Display 400</p>
              <h4 className="font-serif text-2xl text-neutral-900">Premium Materials</h4>
            </div>
            <div>
              <p className="mb-2 text-sm text-neutral-500">Body Text - Inter 400</p>
              <p className="text-base text-neutral-700">
                Our garments are crafted with meticulous attention to detail, combining traditional
                techniques with modern design principles. Each piece tells a story of craftsmanship
                and quality.
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-neutral-500">Body Text - Inter 500</p>
              <p className="text-base font-medium text-neutral-700">
                Medium weight text for emphasis and readability in interface elements.
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-neutral-500">Body Text - Inter 600</p>
              <p className="text-base font-semibold text-neutral-700">
                Semibold text for stronger emphasis and section headers.
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm text-neutral-500">Small Text - Inter 400</p>
              <p className="text-sm text-neutral-600">
                Supporting text and metadata displayed at smaller sizes.
              </p>
            </div>
          </div>
        </section>

        {/* Components Section */}
        <section className="mb-16">
          <h2 className="mb-6 font-serif text-3xl font-semibold text-neutral-900">Components</h2>

          {/* Buttons */}
          <div className="mb-8 rounded-xl bg-white p-8 shadow">
            <h3 className="mb-4 text-xl font-medium text-neutral-800">Buttons</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Button</Button>
              <Button size="sm">Small Button</Button>
              <Button size="lg">Large Button</Button>
            </div>
          </div>

          {/* Cards */}
          <div className="mb-8 rounded-xl bg-white p-8 shadow">
            <h3 className="mb-4 text-xl font-medium text-neutral-800">Cards</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description text</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">
                    Card content with supporting information and details about the item or feature.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary-500">
                <CardHeader>
                  <CardTitle className="text-primary-500">Featured Card</CardTitle>
                  <CardDescription>With primary border</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">
                    This card uses the primary color for emphasis.
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-secondary-50">
                <CardHeader>
                  <CardTitle>Colored Card</CardTitle>
                  <CardDescription>With background color</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600">
                    This card uses a subtle background color.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Inputs & Selects */}
          <div className="mb-8 rounded-xl bg-white p-8 shadow">
            <h3 className="mb-4 text-xl font-medium text-neutral-800">Form Elements</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Text Input</label>
                <Input placeholder="Enter your name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Select Dropdown</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Disabled Input</label>
                <Input placeholder="Disabled state" disabled />
              </div>
            </div>
          </div>

          {/* Dialog & Toast */}
          <div className="rounded-xl bg-white p-8 shadow">
            <h3 className="mb-4 text-xl font-medium text-neutral-800">Overlays</h3>
            <div className="flex flex-wrap gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dialog Title</DialogTitle>
                    <DialogDescription>
                      This is a dialog description. You can place your content here.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    <p className="text-sm text-neutral-600">
                      Dialog content goes here. This demonstrates the modal overlay pattern.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                onClick={() =>
                  toast.success('Success!', {
                    description: 'Your action was completed successfully.',
                  })
                }
              >
                Show Success Toast
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  toast.error('Error!', {
                    description: 'Something went wrong. Please try again.',
                  })
                }
              >
                Show Error Toast
              </Button>
            </div>
          </div>
        </section>

        {/* Design Tokens Section */}
        <section className="mb-16">
          <h2 className="mb-6 font-serif text-3xl font-semibold text-neutral-900">Design Tokens</h2>

          {/* Border Radius */}
          <div className="mb-8 rounded-xl bg-white p-8 shadow">
            <h3 className="mb-4 text-xl font-medium text-neutral-800">Border Radius</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <div className="space-y-2 text-center">
                <div className="mx-auto h-20 w-20 rounded-sm border-2 border-primary-500 bg-primary-100"></div>
                <p className="text-sm font-medium text-neutral-700">Small</p>
                <p className="text-xs text-neutral-500">4px</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto h-20 w-20 rounded border-2 border-primary-500 bg-primary-100"></div>
                <p className="text-sm font-medium text-neutral-700">Default</p>
                <p className="text-xs text-neutral-500">8px</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto h-20 w-20 rounded-md border-2 border-primary-500 bg-primary-100"></div>
                <p className="text-sm font-medium text-neutral-700">Medium</p>
                <p className="text-xs text-neutral-500">12px</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto h-20 w-20 rounded-lg border-2 border-primary-500 bg-primary-100"></div>
                <p className="text-sm font-medium text-neutral-700">Large</p>
                <p className="text-xs text-neutral-500">16px</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto h-20 w-20 rounded-xl border-2 border-primary-500 bg-primary-100"></div>
                <p className="text-sm font-medium text-neutral-700">Extra Large</p>
                <p className="text-xs text-neutral-500">24px</p>
              </div>
            </div>
          </div>

          {/* Shadows */}
          <div className="rounded-xl bg-white p-8 shadow">
            <h3 className="mb-4 text-xl font-medium text-neutral-800">Shadows</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
              <div className="space-y-2 text-center">
                <div className="mx-auto h-20 w-20 rounded-lg bg-white shadow-sm"></div>
                <p className="text-sm font-medium text-neutral-700">Small</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto h-20 w-20 rounded-lg bg-white shadow"></div>
                <p className="text-sm font-medium text-neutral-700">Default</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto h-20 w-20 rounded-lg bg-white shadow-md"></div>
                <p className="text-sm font-medium text-neutral-700">Medium</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto h-20 w-20 rounded-lg bg-white shadow-lg"></div>
                <p className="text-sm font-medium text-neutral-700">Large</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="mx-auto h-20 w-20 rounded-lg bg-white shadow-xl"></div>
                <p className="text-sm font-medium text-neutral-700">Extra Large</p>
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Showcase */}
        <section className="mb-16">
          <h2 className="mb-6 font-serif text-3xl font-semibold text-neutral-900">
            Responsive Layout
          </h2>
          <div className="rounded-xl bg-white p-8 shadow">
            <p className="mb-4 text-neutral-600">
              This page demonstrates mobile-first responsive design. Resize your browser to see the
              layout adapt at different breakpoints:
            </p>
            <div className="space-y-2 text-sm">
              <p className="text-neutral-700">
                <span className="font-semibold">sm (640px):</span> Small devices
              </p>
              <p className="text-neutral-700">
                <span className="font-semibold">md (768px):</span> Tablets
              </p>
              <p className="text-neutral-700">
                <span className="font-semibold">lg (1024px):</span> Desktops
              </p>
              <p className="text-neutral-700">
                <span className="font-semibold">xl (1280px):</span> Large screens
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
