import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import RangeSlider from "react-bootstrap-range-slider";
import Cookies from "universal-cookie";
import { SOUNDS_DICTIONARY } from "../notifications/sounds/Sounds";
import './settings.css';

export const COOKIE_SOUND_STATUS = "User.Notification.Settings.SoundStatus";
export const COOKIE_VOLUME = "User.Notification.Settings.Volume";
export const COOKIE_ALERT_SOUND = "User.Notification.Settings.AlertSound";

export const Settings = () => {
  const [soundStatus, setSoundStatus] = useState(true);
  const [volume, setVolume] = useState(50);
  const [alertSound, setAlertSound] = useState('beep');
  const [formDataChanged, setFormDataChanged] = useState(false);
  const statusRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const cookies = new Cookies();
    const soundCookie =
      cookies.get(COOKIE_SOUND_STATUS) === "false" ? false : true;
    const volumeCookie = cookies.get(COOKIE_VOLUME);
    const alertSoundCookie = cookies.get(COOKIE_ALERT_SOUND);
    setSoundStatus(soundCookie);
    setVolume(volumeCookie ? volumeCookie : 50);
    setAlertSound(alertSoundCookie);
  }, []);

  const handleOnChange = () => {
    setSoundStatus(!soundStatus);
    setFormDataChanged(true);
  };

  const handleVolumeChange = (e: any) => {
    setVolume(e.target.value);
    setFormDataChanged(true);
  };

  const handleAlerSoundChange = () => {
    statusRef.current && setAlertSound(statusRef.current.value);
    setFormDataChanged(true);
  };

  const handleSubmit = () => {
    const cookies = new Cookies();
    cookies.set(COOKIE_SOUND_STATUS, soundStatus, { path: "/", maxAge: 31536000 });
    cookies.set(COOKIE_VOLUME, volume, { path: "/", maxAge: 31536000 });
    const alertSound = statusRef.current ? statusRef.current.value : "beep";
    cookies.set(COOKIE_ALERT_SOUND, alertSound, { path: "/", maxAge: 31536000 });
  };

  return (
    <Container fluid>
      <Form noValidate className="user-settings">
        <Row>
          <Col>Enable Sound</Col>
          <Col>
            <Form.Check
              type="switch"
              id="sound-switch"
              checked={soundStatus}
              onChange={() => handleOnChange()}
            />
          </Col>
          <Col>
            {formDataChanged && (
              <Button type="submit" onClick={() => handleSubmit()}>
                Save
              </Button>
            )}
          </Col>
        </Row>
        {soundStatus && (
          <Row>
            <Col>Volume</Col>
            <Col>
              <RangeSlider
                value={volume}
                variant="success"
                min={0}
                max={100}
                tooltip="on"
                onChange={(e) => handleVolumeChange(e)}
              />
            </Col>
            <Col />
          </Row>
        )}
        {soundStatus && (
          <Row>
            <Col>Choose an alert sound</Col>
            <Col>
              <Form.Control
                as="select"
                placeholder="Alert Sound"
                value={alertSound}
                onChange={() => handleAlerSoundChange()}
                ref={statusRef}
              >
                {Array.from(SOUNDS_DICTIONARY.keys()).map((key: string) => (
                <option>{key}</option>))}
              </Form.Control>
            </Col>
            <Col />
          </Row>
        )}
      </Form>
    </Container>
  );
};

export default Settings;
