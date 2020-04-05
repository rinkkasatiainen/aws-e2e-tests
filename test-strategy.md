# Testing in AWS environment


## End-2-end testing on example. 

To understand the core of all testing, regarding to what and how, it is adviced (by Aki S.) to watch a great video by 
Sandi Metz on [Magic Tricks on testing](https://www.youtube.com/watch?v=URSWYvyc42M). With that information, the 
following applies

### Testing quadrants

Separating everything to either a query or a command, is the core of understanding what to test, and how.

* Query / a function that has a return value
* Command / a function that has a side-effect

And testing these, needs to be done differently  

```

/--------------------+------------------+-------------------\
|   type             |     QUERY        |    COMMAND        |
+--------------------+------------------+-------------------+
|  Incoming          |  Verify the      |  Verify direct    |
|                    |  return value    |  side-effect      |
+--------------------+------------------+-------------------+
|  Sent to self      |     do not       |      do not       |
|                    |      test        |       test        |
+--------------------+------------------+-------------------+
|  Outgoing          |     do not       |      verify       |
|                    |      test        |    message is     |
|                    |                  |       sent        |
\--------------------+------------------+-------------------/
```

Taking this to AWS end-2-end testing, all the same applies.

```

incoming                              outgoing 
   `           `----------------`     `==>
    `==>      /                  \   `
             /     AWS            \
            /    Serverless        \
           /     environment        \
          /                          \
         `----------------------------`
```

when thinking the whole as a unit, the following rules apply.

1) we execute tests by sending messages to the Serverless environment. Either via 
    * invoking lambdas directly (in case where that is appropriate), or
    * sending an event to SNS topic.
1) we create test doubles around the unit -> meaning we fake all the external connections.

