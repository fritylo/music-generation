
import s from './App.module.scss';
import cx from 'classnames';

import { useCallback, useEffect, useRef, useState } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Form, Row, Spinner } from 'react-bootstrap';

import { register } from './queries/register';
import { generate } from './queries/generate';
import { untilUrlCreated } from './queries/tools';

import { AUDIO_QUERY_INTERVAL_FACTOR, AUDIO_QUERY_TIMES, GENRES, MAX_GENRES } from './const';

import { useTranslation, Trans } from "react-i18next";

function App() {
	const { t, i18n } = useTranslation();

	const [isStart, setIsStart] = useState(true);
	const [isAudioReady, setIsAudioReady] = useState(true);
	const [audioSrc, setAudioSrc] = useState('');

	const selectedGenres = useRef<Record<string, boolean>>({});
	
	const emailRef = useRef<HTMLInputElement>(null);
	const loopRef = useRef<HTMLInputElement>(null);
	const durationRef = useRef<HTMLInputElement>(null);
	const audioRef = useRef<HTMLAudioElement>(null);
	
	const handleGenreChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
		const genreName = e.target.dataset.name || '';
		const genreChecked = e.target.checked;
		
		selectedGenres.current[genreName] = genreChecked;
	}, []);
	
	useEffect(() => {
		if (isAudioReady && !isStart)
			audioRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [isAudioReady]);
	
	const handleLanguageChange: React.ChangeEventHandler<HTMLSelectElement> = useCallback((e) => {
		const language = e.target.value
		console.log(language);
		i18n.changeLanguage(language);
	}, [i18n]);
	
	const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(async (e) => {
		e.preventDefault();
		
		setIsStart(false);
		
		const genres = Object.entries(selectedGenres.current)
			.filter(([name, isSelected]) => isSelected)
			.map(([name, isSelected]) => name);
			
		const duration = parseInt(durationRef.current?.value || '5');
		const loop = loopRef.current?.checked || false;
		const email = emailRef.current?.value || '';
		
		if (genres.length === 0) {
			alert(t('Select at list 1 genre!'));
			return;
		} else if (genres.length > MAX_GENRES) {
			alert(t('You selected to much genres. Max count {{count}}...', {count: MAX_GENRES}));
			return;
		}
		
		setIsAudioReady(false);
		
		const { result: registerResult, error: registerError } = await register(email);
		
		if (registerError) {
			alert(t(
				'Error while taking API key by email "{{message}}". Check that your email is correct or try to connect via VPN', 
			{ message: registerError.message }));
			setIsAudioReady(true);
			return;
		}
		
		const personalAccessToken: string = registerResult.data.data.pat;
		
		const { result: generateResult, error: generateError } = await generate(
			personalAccessToken, 
			duration, 
			genres, 
			loop ? 'loop' : 'track'
		);
		
		if (generateError) {
			alert(t(
				'Error while track generation "{{message}}". Try to use VPN and repeat one more time. If it won\'t help email to.fritylo@gmail.com',
			{ message: generateError.message }));
			setIsAudioReady(true);
			return;
		}
		
		const audioSrc = generateResult.data.data.tasks[0].download_link;
		
		const queryInterval = Math.max(2000, duration * AUDIO_QUERY_INTERVAL_FACTOR);
		const reachable = await untilUrlCreated(audioSrc, [404], AUDIO_QUERY_TIMES, queryInterval);
		
		if (!reachable) {
			alert(t(
				'Generation take to long. Try to use VPN and repeat one nore time. If it won\'t help - try to reduce track duration.'
			));
			setIsAudioReady(true);
			return;
		}
		
		setIsAudioReady(true);
		setAudioSrc(audioSrc);
	}, []);

	return (
		<div className={cx(s.App)}>
			<Container>
				<h1 className='mt-5 text-center'>
					<Trans>Create music in touch</Trans>
				</h1>
				
				<Form.Select aria-label="Select language" value={i18n.language} onChange={handleLanguageChange}>
					<option value="en">English</option>
					<option value="ru">Русский</option>
					<option value="ua">Українська</option>
				</Form.Select>

				<Row>
					<Form className='mt-4 mb-4' onSubmit={handleFormSubmit}>
						<Form.Group className="mb-3" controlId="formBasicEmail">
							<Form.Label>
								<Trans>Genres</Trans>
							</Form.Label>
							<div className={cx(s.checkboxes)}>
								{GENRES.map(genre => (
									<Form.Check
										type='checkbox'
										id={`checkbox-${genre}`}
										key={genre}
										label={genre}
										data-name={genre}
										onChange={handleGenreChange}
									/>
								))}
							</div>
							<Form.Text className="text-muted">
								<Trans count={MAX_GENRES}>
									Determines mood of track. Recommend to use not more than {'{{count}}'} genres.
								</Trans>
							</Form.Text>
						</Form.Group>
						
						<Form.Group className="mb-3" controlId="formBasicEmail">
							<Form.Label>
								<Trans>Track duration</Trans>
							</Form.Label>
							<Form.Control type="number" placeholder="Введи число..." required defaultValue={5} ref={durationRef} />
							<Form.Text className="text-muted">
								<Trans>Determines how long final track would be</Trans>
							</Form.Text>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formBasicEmail">
							<Form.Label>
								<Trans>Email</Trans>
							</Form.Label>
							<Form.Control type="email" name="email" placeholder={t('Enter email...') as string} required ref={emailRef} />
							<Form.Text className="text-muted">
								<Trans>
									Used to receive API token, for music generation. Non-existing email can bring to errors...
								</Trans>
							</Form.Text>
						</Form.Group>

						<Form.Group className="mb-3" controlId="formBasicCheckbox">
							<Form.Label>
								<Trans>Loop track?</Trans>
							</Form.Label>
							<Form.Check type="checkbox" label={t('Yes')} ref={loopRef} />
							<Form.Text className="text-muted">
								<Trans>
									Looped track ends same beat, it starts on
								</Trans>
							</Form.Text>
						</Form.Group>

						<Button variant="primary" type="submit" disabled={!isAudioReady}>
							{isAudioReady ? <>
								<Trans>Generate</Trans>
							</> : <>
								<Trans>Generating...</Trans>
							</>}
						</Button>
						
						{!isAudioReady && (
							<Spinner animation="border" role="status" className='ms-3' variant='primary' size='sm'>
								<span className="visually-hidden">Loading...</span>
							</Spinner>
						)}
					</Form>
				</Row>
				
				{isAudioReady && !isStart && (
					<audio controls loop={loopRef.current?.checked} ref={audioRef}>
						<source src={audioSrc} type="audio/mpeg" />
						<Trans>Your browser does not support the audio.</Trans>
					</audio>
				)}
			</Container>
		</div>
	);
}

export default App;
