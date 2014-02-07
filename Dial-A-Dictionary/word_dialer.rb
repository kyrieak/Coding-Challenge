class WordDialer

  def initialize(dictionary)
    @word_seq = Hash.new()

    File.open(dictionary, 'r') do |file|
      file.readlines.each do |line|
        word = line.chomp
        if (word.length > 0)
          num_key = WordDialer.get_num_val(word)
          
          if (@word_seq[num_key].nil?)
            @word_seq[num_key] = [word]
          else
            @word_seq[num_key] << word
          end
        end
      end
    end

  end

  def self.get_num_val(string)
    numstring = ''
    string.chars.each{ |c| numstring << char_to_num(c) }
    return numstring.to_i
  end

  def find_words(phone_number, min_len = 3)
    if (phone_number.length > min_len)
      max_len = phone_number.length
      result = {}

      # range of word lengths
      (min_len..max_len).each do |w_len|
        find_words_of_length(w_len, phone_number) do |index, word_list|
          result[index] = [] if (result[index].nil?)
          result[index] += word_list
        end
      end
      print_result(phone_number, result)
    else
      puts "phone number is too short."
    end
  end


  private

  # yields starting index and list of words
  # in the phone number of a given length.

  def find_words_of_length(w_len, phone_number)
    pn_len = phone_number.length
    index = 0

    while (index <= (pn_len - w_len)) do
      seq = phone_number[index...(index + w_len)]
      num_key = seq.to_i

      if ((seq[0] != '0') && @word_seq[num_key])
        yield index, @word_seq[num_key]
      end
      index += 1
    end

  end

  def print_result(phone_number, result)
    pn_len = phone_number.length

    result.each do |index, words|
      words.each do |word|
        print_grey(with_spacing(phone_number[0...index]) + "-") if index > 0
        print_bold(with_spacing(word.capitalize))
        print_grey("-" + with_spacing(phone_number[(index + word.length)...pn_len])) if (index + word.length) < pn_len
        puts "\n\n"
      end
    end
    return nil
  end

  def with_spacing(text)
    text.chars.to_a.join(' ')
  end

  def print_grey(text)
    print "\e[2m" + text + "\e[0m"
  end

  def print_bold(text)
    print "\e[1m" + text + "\e[0m"
  end

  def self.char_to_num(letter)
    letter.downcase!

    if ((letter < 'a') || (letter > 'z'))
      return ''
    elsif (letter < 'd')
      # abc
      return '2'
    elsif (letter < 'g')
      # def
      return '3'
    elsif (letter < 'j')
      # ghi
      return '4'
    elsif (letter < 'm')
      # jkl
      return '5'
    elsif (letter < 'p')
      # mno
      return '6'
    elsif (letter < 't')
      # pqrs
      return '7'
    elsif (letter < 'w')
      # tuv
      return '8'
    elsif (letter <= 'z')
      # wxyz
      return '9'
    end
  end

end

dialer = WordDialer.new("dict.txt")
dialer.find_words('685377262464', 4)
puts WordDialer.get_num_val('MulePrancing')