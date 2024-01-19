import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {
  Button,
  Card,
  Text,
  Image,
  View,
  XStack,
  Paragraph,
  YStack,
} from 'tamagui';
import { PostFlat } from '.';
import { Persona } from '../personas';
import { Account } from '../accounts';
import { timeAgo } from '../../utils';

export type PostComponentProps = {
  post: PostFlat;
  indexInThread: number;
};

export default function PostComponent({
  post,
  indexInThread = 0,
}: PostComponentProps) {
  const { accountId, personaId, content } = post;

  const account: Account = useAppSelector(
    state => state.accounts.byId[accountId],
  );

  const persona: Persona = useAppSelector(
    state => state.personas.byId[personaId],
  );

  return (
    <Card bordered padded marginBottom="$6">
      <XStack gap="$6" flex={1}>
        <View width={150}>
          <YStack gap="$1" marginBottom="$2">
            <Text fontWeight="700">{persona.displayName}</Text>
            <Text fontSize="$2" color="$gray10">
              {account.username}
            </Text>
          </YStack>
          {persona.avatar && (
            <Image
              borderRadius="$1"
              source={{ uri: persona.avatar, width: 150, height: 150 }}
            />
          )}
          {!persona.avatar && <Text>No avatar</Text>}
        </View>
        <View flex={1}>
          <YStack flex={1}>
            {!!indexInThread && (
              <XStack marginBottom="$4" justifyContent="space-between">
                <Text alignSelf="flex-start" fontSize="$1" color="$gray10">
                  {timeAgo(post.dateCreated)}{' '}
                  {post.dateUpdated && `(edited ${timeAgo(post.dateUpdated)})`}
                </Text>
                <Text alignSelf="flex-end" fontSize="$1" color="$gray10">
                  #{indexInThread}
                </Text>
              </XStack>
            )}
            <View flex={1}>
              <Paragraph>{content}</Paragraph>
            </View>
            <XStack
              marginTop="$4"
              alignItems="center"
              justifyContent="space-between">
              <Text alignSelf="flex-end" fontSize="$1" color="$gray10">
                ID: {post.id}
              </Text>
            </XStack>
          </YStack>
        </View>
      </XStack>
    </Card>
  );
}
