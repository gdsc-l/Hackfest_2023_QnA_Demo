import { useState } from 'react';
import { Inter } from 'next/font/google';
import { Button, Container, Textarea, Text, Title, Flex, Paper } from '@mantine/core';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

dayjs.extend(relativeTime);

const inter = Inter({ subsets: ['latin'] });

function QuestionCard(props) {
  return (
    <Paper withBorder shadow="sm" px="sm" py="xs">
      <Title order={4}>{props.question}</Title>
      <Flex justify="space-between" align="center">
        <Text color="gray" size="xs">
          {dayjs(props.createdDate).fromNow()}
        </Text>
        <Button variant={props.didUpvote ? 'filled' : 'outline'} size="xs" onClick={props.onUpvote}>
          {props.upvotes}
          ⬆️
        </Button>
      </Flex>
    </Paper>
  );
}

const getQuestions = async () => {
  const res = await fetch('/api/questions');

  return await res.json();
};

const upvoteQuestion = async (data) => {
  const res = await fetch('/api/questions', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: data.id,
      action: data.action,
    }),
  });
  return res.json;
};

const createQuestion = async (data) => {
  const res = await fetch('/api/questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: data.question,
    }),
  });
  return res.json();
};

export default function Home() {
  // useState is a React Hook that lets you add a state variable to your component.
  const [question, setQuestion] = useState('');
  const [allQuestions, setAllQuestions] = useState([]);

  const queryClient = useQueryClient();

  const questionsQuery = useQuery(['questions'], getQuestions, {
    onSuccess: (data) => {
      const upvotedQuestions = JSON.parse(localStorage.getItem('upvotedQuestions')) || [];

      setAllQuestions(
        data.map((q) => {
          if (upvotedQuestions.includes(q.id)) {
            return {
              ...q,
              didUpvote: true,
            };
          }
          return q;
        })
      );
    },
  });

  questionsQuery.isFe;

  const upvoteQuestionMutation = useMutation(upvoteQuestion, {
    onSuccess: (_data, variables) => {
      queryClient.refetchQueries(['questions']);
      const upvotedQuestions = JSON.parse(localStorage.getItem('upvotedQuestions')) || [];
      if (variables.action === 'add') {
        localStorage.setItem(
          'upvotedQuestions',
          JSON.stringify([...upvotedQuestions, variables.id])
        );
      } else {
        localStorage.setItem(
          'upvotedQuestions',
          JSON.stringify(upvotedQuestions.filter((id) => id !== variables.id))
        );
      }
    },
  });

  const createQuestionMutation = useMutation(createQuestion, {
    onSuccess: () => {
      queryClient.refetchQueries(['questions']);
    },
  });

  return (
    <Container py="md">
      <form
        onSubmit={(e) => {
          // Prevents the normal form submission which would refresh the page
          e.preventDefault();

          const data = new FormData(e.target);
          const q = data.get('question');

          setQuestion('');
          createQuestionMutation.mutate({ question: q });
        }}
      >
        <Title order={3}>Enter your question!</Title>
        <Textarea
          minRows={5}
          name="question"
          value={question}
          onChange={(e) => {
            setQuestion(e.currentTarget.value);
          }}
        />
        <Flex justify="flex-end" mt="sm">
          <Button type="submit"> Submit</Button>
        </Flex>
      </form>
      <Flex direction="column" gap="md" mt="lg">
        {allQuestions?.map((obj, i) => {
          return (
            <QuestionCard
              question={obj.question}
              createdDate={obj.createdAt}
              upvotes={obj.upvotes}
              didUpvote={obj.didUpvote}
              onUpvote={() => {
                // Prevents the user from upvoting multiple times
                if (upvoteQuestionMutation.isLoading || questionsQuery.isFetching) return;
                if (obj.didUpvote) {
                  // Already upvoted
                  upvoteQuestionMutation.mutate({
                    id: obj.id,
                    action: 'remove',
                  });
                } else {
                  // Haven't upvoted
                  upvoteQuestionMutation.mutate({
                    id: obj.id,
                    action: 'add',
                  });
                }
              }}
              key={obj.id}
            />
          );
        })}
      </Flex>
    </Container>
  );
}
