import { deepFreeze } from '../deep-freeze';

describe('deep-freeze', () => {
  it('freezes plain objects', () => {
    const user = {
      apple: 1,
      credentials: {
        email: 'abc@example.com',
        passwordHash: 'abc',
      },
    };

    deepFreeze(user);

    expect(() => {
      user.apple = 2;
    }).toThrow();
  });

  it('freezes nested objects in plain objects', () => {
    const user = {
      apple: 1,
      credentials: {
        email: 'abc@example.com',
        passwordHash: 'abc',
      },
    };

    deepFreeze(user);

    expect(() => {
      user.credentials.email = 'def@example.com';
    }).toThrow();
  });

  it('freezes arrays', () => {
    const users = [{ name: 'A' }, { name: 'B' }];

    deepFreeze(users);

    expect(() => {
      users.push({ name: 'C' });
    }).toThrow();
  });

  it('freezes array elements', () => {
    const userA = { name: 'A' };
    const userB = { name: 'B' };
    const users = [userA, userB];

    deepFreeze(users);

    expect(() => {
      userA.name = 'D';
    }).toThrow();
  });
});
