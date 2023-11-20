import {
  Flex,
  Spinner,
  SpinnerContainer,
  Headline,
  Text,
} from "brainly-style-guide";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <Flex
      direction={"column"}
      fullWidth
      fullHeight
      justifyContent="center"
      alignItems="center"
      className="sg-space-y-m"
    >
      <Headline color="text-gray-60">
        Szukam super przepisów...
      </Headline>
      <Spinner color="white" />
    </Flex>
  );
}
