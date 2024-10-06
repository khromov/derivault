import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Trash2, Plus, Settings, AlertTriangle, Copy, Edit, LogOut } from 'lucide-react';

const PasswordManager = () => {
	const [screen, setScreen] = useState('welcome');
	const [passphrase, setPassphrase] = useState('');
	const [masterKey, setMasterKey] = useState(null);
	const [sites, setSites] = useState([]);
	const [newSite, setNewSite] = useState({ email: '', domain: '', rotationRounds: 1 });
	const [editingSite, setEditingSite] = useState(null);
	const [hoveredSite, setHoveredSite] = useState(null);
	const [passwords, setPasswords] = useState({});
	const [computationIntensity, setComputationIntensity] = useState(3);

	useEffect(() => {
		const storedSites = localStorage.getItem('passwordManagerSites');
		const storedIntensity = localStorage.getItem('passwordManagerIntensity');
		if (storedSites) {
			setSites(JSON.parse(storedSites));
		}
		if (storedIntensity) {
			setComputationIntensity(parseInt(storedIntensity, 10));
		}
	}, []);

	const saveSites = useCallback((updatedSites) => {
		localStorage.setItem('passwordManagerSites', JSON.stringify(updatedSites));
	}, []);

	const saveComputationIntensity = useCallback((intensity) => {
		localStorage.setItem('passwordManagerIntensity', intensity.toString());
	}, []);

	const deriveMasterKey = async (passphrase) => {
		const encoder = new TextEncoder();
		const passphraseBuffer = encoder.encode(passphrase);
		const salt = encoder.encode('ConstantSaltForDeterministicResults');

		const keyMaterial = await window.crypto.subtle.importKey(
			'raw',
			passphraseBuffer,
			{ name: 'PBKDF2' },
			false,
			['deriveBits']
		);

		const derivedBits = await window.crypto.subtle.deriveBits(
			{
				name: 'PBKDF2',
				salt: salt,
				iterations: 100000 * computationIntensity,
				hash: 'SHA-256'
			},
			keyMaterial,
			256
		);

		return new Uint8Array(derivedBits);
	};

	const generatePassword = useCallback(
		async (site) => {
			if (masterKey && site.email && site.domain) {
				const encoder = new TextEncoder();
				const siteData = encoder.encode(`${site.email}:${site.domain}:${site.rotationRounds}`);

				const hmacKey = await window.crypto.subtle.importKey(
					'raw',
					masterKey,
					{ name: 'HMAC', hash: 'SHA-256' },
					false,
					['sign']
				);

				const signature = await window.crypto.subtle.sign('HMAC', hmacKey, siteData);

				const hashArray = Array.from(new Uint8Array(signature));
				const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

				const allChars =
					'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

				let password = '';
				for (let i = 0; i < 16; i++) {
					const charIndex = parseInt(hashHex.substr(i * 2, 2), 16) % allChars.length;
					password += allChars[charIndex];
				}

				return password;
			}
			return '';
		},
		[masterKey]
	);

	useEffect(() => {
		const updatePasswords = async () => {
			if (masterKey) {
				const newPasswords = {};
				for (const site of sites) {
					newPasswords[site.email] = await generatePassword(site);
				}
				setPasswords(newPasswords);
			}
		};

		updatePasswords();
	}, [sites, generatePassword, masterKey]);

	useEffect(() => {
		if (masterKey && newSite.email && newSite.domain) {
			generatePassword(newSite).then((password) => {
				setPasswords((prev) => ({ ...prev, [newSite.email]: password }));
			});
		}
	}, [newSite, generatePassword, masterKey]);

	const addSite = () => {
		if (newSite.email && newSite.domain) {
			const updatedSites = [...sites, newSite];
			setSites(updatedSites);
			saveSites(updatedSites);
			setNewSite({ email: '', domain: '', rotationRounds: 1 });
		}
	};

	const removeSite = (index) => {
		const updatedSites = sites.filter((_, i) => i !== index);
		setSites(updatedSites);
		saveSites(updatedSites);
	};

	const editSite = (index) => {
		setEditingSite(index);
		setNewSite(sites[index]);
		setScreen('addSite');
	};

	const updateSite = () => {
		if (newSite.email && newSite.domain) {
			const updatedSites = [...sites];
			updatedSites[editingSite] = newSite;
			setSites(updatedSites);
			saveSites(updatedSites);
			setNewSite({ email: '', domain: '', rotationRounds: 1 });
			setEditingSite(null);
			setScreen('main');
		}
	};

	const copyToClipboard = (password) => {
		navigator.clipboard.writeText(password);
	};

	const panicButton = () => {
		localStorage.removeItem('passwordManagerSites');
		localStorage.removeItem('passwordManagerIntensity');
		setSites([]);
		setPasswords({});
		setPassphrase('');
		setMasterKey(null);
		setComputationIntensity(3);
		setScreen('welcome');
	};

	const handleEnter = async () => {
		if (passphrase) {
			const key = await deriveMasterKey(passphrase);
			setMasterKey(key);
			setScreen('main');
		}
	};

	const renderWelcomeScreen = () => (
		<div className="grid w-full items-center gap-4">
			<div className="flex flex-col space-y-1.5">
				<Label htmlFor="passphrase">Passphrase</Label>
				<Input
					id="passphrase"
					type="password"
					placeholder="Enter your passphrase"
					value={passphrase}
					onChange={(e) => setPassphrase(e.target.value)}
				/>
			</div>
			<div className="flex flex-col space-y-1.5">
				<Label htmlFor="computationIntensity">Computation Intensity: {computationIntensity}</Label>
				<Slider
					id="computationIntensity"
					min={1}
					max={10}
					step={1}
					value={[computationIntensity]}
					onValueChange={(value) => {
						setComputationIntensity(value[0]);
						saveComputationIntensity(value[0]);
					}}
				/>
			</div>
			<Button onClick={handleEnter} disabled={!passphrase}>
				Enter
			</Button>
		</div>
	);

	const renderMainScreen = () => (
		<div className="grid w-full items-center gap-4">
			<div className="space-y-4">
				{sites.map((site, index) => (
					<Card key={index} className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold">{site.domain}</div>
								<div className="text-sm text-gray-500">{site.email}</div>
								<div className="text-xs text-gray-400">Rotation: {site.rotationRounds}</div>
							</div>
							<div className="flex items-center space-x-2">
								{hoveredSite === index && (
									<div className="rounded bg-gray-100 p-1 font-mono text-sm">
										{passwords[site.email] || 'Generating...'}
									</div>
								)}
								<Button
									onClick={() => copyToClipboard(passwords[site.email])}
									size="sm"
									onMouseEnter={() => setHoveredSite(index)}
									onMouseLeave={() => setHoveredSite(null)}
								>
									<Copy size={16} />
								</Button>
								<Button onClick={() => editSite(index)} size="sm" variant="outline">
									<Edit size={16} />
								</Button>
								<Button onClick={() => removeSite(index)} size="sm" variant="destructive">
									<Trash2 size={16} />
								</Button>
							</div>
						</div>
					</Card>
				))}
			</div>
			<div className="fixed bottom-4 right-4 flex space-x-2">
				<Button onClick={() => setScreen('welcome')} size="icon" variant="outline">
					<LogOut size={24} />
				</Button>
				<Button onClick={() => setScreen('settings')} size="icon" variant="outline">
					<Settings size={24} />
				</Button>
				<Button
					onClick={() => {
						setEditingSite(null);
						setNewSite({ email: '', domain: '', rotationRounds: 1 });
						setScreen('addSite');
					}}
					size="icon"
				>
					<Plus size={24} />
				</Button>
			</div>
		</div>
	);

	const renderAddSiteScreen = () => (
		<div className="grid w-full items-center gap-4">
			<div className="flex flex-col space-y-1.5">
				<Label htmlFor="email">Email/Username</Label>
				<Input
					id="email"
					placeholder="Enter email or username"
					value={newSite.email}
					onChange={(e) => setNewSite({ ...newSite, email: e.target.value })}
				/>
			</div>
			<div className="flex flex-col space-y-1.5">
				<Label htmlFor="domain">Domain</Label>
				<Input
					id="domain"
					placeholder="Enter website domain"
					value={newSite.domain}
					onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
				/>
			</div>
			<div className="flex flex-col space-y-1.5">
				<Label htmlFor="rotationRounds">Password Rotation: {newSite.rotationRounds}</Label>
				<Slider
					id="rotationRounds"
					min={1}
					max={10}
					step={1}
					value={[newSite.rotationRounds]}
					onValueChange={(value) => setNewSite({ ...newSite, rotationRounds: value[0] })}
				/>
			</div>
			{newSite.email && newSite.domain && (
				<div className="flex flex-col space-y-1.5">
					<Label>Generated Password</Label>
					<div className="rounded bg-gray-100 p-2 font-mono text-sm">
						{passwords[newSite.email] || 'Generating...'}
					</div>
				</div>
			)}
			<Button
				onClick={() => {
					editingSite !== null ? updateSite() : addSite();
					setScreen('main');
				}}
			>
				{editingSite !== null ? 'Update Site' : 'Add Site'}
			</Button>
			<Button
				onClick={() => {
					setNewSite({ email: '', domain: '', rotationRounds: 1 });
					setEditingSite(null);
					setScreen('main');
				}}
				variant="outline"
			>
				Cancel
			</Button>
		</div>
	);

	const renderSettingsScreen = () => (
		<div className="grid w-full items-center gap-4">
			<Button onClick={panicButton} variant="destructive">
				<AlertTriangle size={16} className="mr-2" />
				Panic Button (Clear All Data)
			</Button>
			<Button onClick={() => setScreen('main')} variant="outline">
				Back to Main
			</Button>
		</div>
	);

	return (
		<div className="flex min-h-screen items-center justify-center bg-gray-100">
			<Card className="m-4 w-full max-w-[600px]">
				<CardHeader>
					<CardTitle>Offline Password Manager</CardTitle>
				</CardHeader>
				<CardContent>
					{screen === 'welcome' && renderWelcomeScreen()}
					{screen === 'main' && renderMainScreen()}
					{screen === 'addSite' && renderAddSiteScreen()}
					{screen === 'settings' && renderSettingsScreen()}
				</CardContent>
			</Card>
		</div>
	);
};

export default PasswordManager;
