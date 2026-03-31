"use client"

import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function PrivacyFAQ() {
  return (
    <div className="space-y-6">
      <Card className="bg-apex-dark/50 border-gray-800 p-6">
        <h3 className="text-xl font-bold text-white mb-2">Privacy FAQ</h3>
        <p className="text-sm text-apex-gray mb-6">Plain-English answers to common privacy questions</p>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1" className="border-gray-700">
            <AccordionTrigger className="text-white hover:text-apex-primary">Where is my data stored?</AccordionTrigger>
            <AccordionContent className="text-apex-gray">
              Your data is stored entirely on your device using IndexedDB (a browser database). It never leaves your
              computer or phone. Think of it like saving a file to your hard drive - it stays with you, not on our
              servers.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-gray-700">
            <AccordionTrigger className="text-white hover:text-apex-primary">Can you see my data?</AccordionTrigger>
            <AccordionContent className="text-apex-gray">
              No, we literally cannot see your data. It's encrypted on your device before storage using military-grade
              encryption (AES-256-GCM). Even if we wanted to access it (we don't), it's mathematically impossible
              without your master password.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-gray-700">
            <AccordionTrigger className="text-white hover:text-apex-primary">
              What happens if I forget my password?
            </AccordionTrigger>
            <AccordionContent className="text-apex-gray">
              Unfortunately, your data cannot be recovered. This is the trade-off for true privacy - we don't have a
              "master key" or backdoor. We recommend exporting encrypted backups regularly and storing them securely.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-gray-700">
            <AccordionTrigger className="text-white hover:text-apex-primary">
              Do you track my usage or behavior?
            </AccordionTrigger>
            <AccordionContent className="text-apex-gray">
              No. We don't use analytics, cookies, or any tracking technology. We have no idea how you use Apex, what
              features you prefer, or even how often you log in. Your activity is completely private.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border-gray-700">
            <AccordionTrigger className="text-white hover:text-apex-primary">Can I use Apex offline?</AccordionTrigger>
            <AccordionContent className="text-apex-gray">
              Yes! Since all processing happens locally, Apex works completely offline. You can use it on a plane, in a
              basement, or anywhere without internet. Your data is always accessible.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border-gray-700">
            <AccordionTrigger className="text-white hover:text-apex-primary">
              How do I back up my data?
            </AccordionTrigger>
            <AccordionContent className="text-apex-gray">
              Go to the Audit Trail tab and click "Export Encrypted Backup". This downloads a JSON file containing your
              encrypted vault. Store this file securely (like in a password manager or encrypted cloud storage). You can
              import it later to restore your data.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border-gray-700">
            <AccordionTrigger className="text-white hover:text-apex-primary">
              Is my data safe from hackers?
            </AccordionTrigger>
            <AccordionContent className="text-apex-gray">
              Your data is encrypted at rest, meaning even if someone gains access to your device's storage, they would
              only see encrypted gibberish. However, if your vault is unlocked (you're logged in), the data is decrypted
              in memory and could be vulnerable to malware or keyloggers. Always lock your vault when not in use.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8" className="border-gray-700">
            <AccordionTrigger className="text-white hover:text-apex-primary">
              Can I sync across devices?
            </AccordionTrigger>
            <AccordionContent className="text-apex-gray">
              Not automatically. To maintain privacy, we don't offer cloud sync. However, you can manually export your
              vault from one device and import it on another. This ensures you control where your data goes.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9" className="border-gray-700">
            <AccordionTrigger className="text-white hover:text-apex-primary">
              What if I clear my browser data?
            </AccordionTrigger>
            <AccordionContent className="text-apex-gray">
              Clearing browser data will delete your vault. Always export a backup before clearing browser storage.
              IndexedDB data is usually preserved when clearing "cookies and site data" but deleted when clearing "all
              data" or "site settings".
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10" className="border-gray-700">
            <AccordionTrigger className="text-white hover:text-apex-primary">
              Is the code really open source?
            </AccordionTrigger>
            <AccordionContent className="text-apex-gray">
              Yes! All encryption and security code is open source and available on GitHub. Security researchers and
              developers can audit our implementation to verify our privacy claims. Transparency builds trust.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    </div>
  )
}
