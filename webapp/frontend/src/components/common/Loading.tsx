import { Spinner, Container } from "react-bootstrap";

export const Loading = (props: { show: boolean }) => {
  return (
    <Container style={props.show ? {} : { display: 'none' }}>
      <Spinner animation="grow" variant="primary" />{' '}
      <Spinner animation="grow" variant="secondary" />{' '}
      <Spinner animation="grow" variant="success" />{' '}
      <Spinner animation="grow" variant="danger" />{' '}
      <Spinner animation="grow" variant="warning" />{' '}
      <Spinner animation="grow" variant="info" />
    </Container>
  );
};

export default Loading;
