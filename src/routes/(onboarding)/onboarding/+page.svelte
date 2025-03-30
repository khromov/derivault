<script lang="ts">
	import { goto } from '$app/navigation';
	import OnboardingCarousel from '$lib/components/OnboardingCarousel.svelte';
	import Key from 'lucide-svelte/icons/key';
	import RefreshCw from 'lucide-svelte/icons/refresh-cw';
	import Copy from 'lucide-svelte/icons/copy';
	import FileText from 'lucide-svelte/icons/file-text';

	const steps = [
		{
			title: 'How does DeriVault work?',
			description:
				"DeriVault is a different kind of password manager. It generates unique passwords for each of your sites using only your master passphrase - either a password or a BIP39 passphrase. No passwords are ever stored - they're generated on demand using cryptographic functions.",
			icon: Key
		},
		{
			title: 'What happens if I enter the wrong passphrase?',
			description:
				'In DeriVault, there are no "right" or "wrong" passphrases. The master passphrase is used to derive a unique password for each of your sites. If you enter the wrong passphrase, DeriVault will generate passwords for your stored sites, but they won\'t be correct.',
			icon: Key
		},
		{
			title: 'Backups are optional',
			description:
				'As long as you remember your master passphrase, your username and the site you are logging in to, you don\'t need to back anything up, as the passwords are generated on-demand in a deterministic fashion. That\'s why we call DeriVault a "plausible deniability" password manager.',
			icon: FileText
		},
		{
			title: 'What is stored',
			description:
				'If you choose to add a site, DeriVault will store your email address, domain, and the number of password rotations you want to use locally on your device. You can export this data to a file and import it on another device.',
			icon: Key
		},
		{
			title: 'Password rotation',
			description:
				'Need to rotate a password for a site? Increment the rotation counter for that site under the Advanced tab.',
			icon: RefreshCw
		},
		{
			title: 'Quick access',
			description:
				'Copy passwords to your clipboard with one click. Search through your saved sites easily to find what you need.',
			icon: Copy
		}
	];

	let currentStep = 0;

	function handleNext() {
		if (currentStep < steps.length - 1) {
			currentStep++;
		}
	}

	function handlePrevious() {
		if (currentStep > 0) {
			currentStep--;
		}
	}

	function handleComplete() {
		goto(`#/`);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
	<OnboardingCarousel
		{steps}
		{currentStep}
		onNext={handleNext}
		onPrevious={handlePrevious}
		onComplete={handleComplete}
	/>
</div>
